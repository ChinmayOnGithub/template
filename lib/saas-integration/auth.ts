/*
 * auth.ts
 * Service-to-service authentication and signature verification for SaaS integration.
 * Protects communication between the central Admin Portal and connected products.
 */

import crypto from "node:crypto";
import { AppError } from "../api";

export interface SignatureVerificationOptions {
  signatureHeader: string;
  payload: string;
  keyResolver: (kid: string) => string | undefined;
  maxSkewSeconds?: number;
}

// In-memory replay cache tracking seen signatures within the validity window
const seenSignatures = new Map<string, number>();

function cleanReplayCache(now: number, maxWindowMs: number): void {
  for (const [sig, timestamp] of seenSignatures.entries()) {
    if (now - timestamp > maxWindowMs) {
      seenSignatures.delete(sig);
    }
  }
}

export function generatePortalSignature(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000),
): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${timestamp}.${payload}`);
  const digest = hmac.digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

export function verifyPortalSignature({
  signatureHeader,
  payload,
  keyResolver,
  maxSkewSeconds = 300,
}: SignatureVerificationOptions): { valid: boolean; timestamp: number } {
  if (!signatureHeader) {
    throw new AppError("Missing integration signature header", 401, "UNAUTHORIZED");
  }

  const parts = signatureHeader.split(",");
  let timestampStr: string | undefined;
  let signatureHex: string | undefined;

  for (const part of parts) {
    const [k, v] = part.split("=");
    if (k === "t") timestampStr = v;
    if (k === "v1") signatureHex = v;
  }

  if (!timestampStr || !signatureHex) {
    throw new AppError("Malformed integration signature header", 401, "UNAUTHORIZED");
  }

  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    throw new AppError("Invalid timestamp in integration signature", 401, "UNAUTHORIZED");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const skew = Math.abs(nowSeconds - timestamp);

  if (skew > maxSkewSeconds) {
    throw new AppError("Integration signature timestamp expired or skewed", 401, "UNAUTHORIZED");
  }

  // Replay prevention
  cleanReplayCache(Date.now(), maxSkewSeconds * 1000);
  if (seenSignatures.has(signatureHex)) {
    throw new AppError("Replay detected for integration signature", 401, "UNAUTHORIZED");
  }

  // Resolve key
  const secret = keyResolver("default");
  if (!secret) {
    throw new AppError("Integration signing secret is not configured", 500, "INTERNAL_ERROR");
  }

  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(`${timestamp}.${payload}`);
  const expectedDigest = hmac.digest("hex");

  const expectedBuffer = Buffer.from(expectedDigest, "utf8");
  const actualBuffer = Buffer.from(signatureHex, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    throw new AppError("Invalid integration signature", 401, "UNAUTHORIZED");
  }

  const matches = crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  if (!matches) {
    throw new AppError("Invalid integration signature", 401, "UNAUTHORIZED");
  }

  // Record signature to prevent replay
  seenSignatures.set(signatureHex, Date.now());

  return { valid: true, timestamp };
}

export function clearReplayCacheForTesting(): void {
  seenSignatures.clear();
}
