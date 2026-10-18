/*
 * auth.ts
 * Service-to-service authentication and signature verification for SaaS integration.
 * Supports RSA-SHA256 production verification and HMAC-SHA256 for local tests only.
 */

import crypto from "node:crypto";
import { AppError } from "../api";

export interface SignatureVerificationOptions {
  signatureHeader: string;
  payload: string;
  keyResolver: (kid: string) => string | undefined;
  maxSkewSeconds?: number;
}

// Process-local replay protection is best-effort only; production deployments must also
// enforce durable eventId/idempotency uniqueness in their shared persistence layer.
const seenSignatures = new Map<string, number>();

function cleanReplayCache(now: number, maxWindowMs: number): void {
  for (const [signature, timestamp] of seenSignatures.entries()) {
    if (now - timestamp > maxWindowMs) seenSignatures.delete(signature);
  }
}

export function generatePortalSignature(
  payload: string,
  secret: string,
  timestamp: number = Math.floor(Date.now() / 1000),
): string {
  const digest = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}.${payload}`)
    .digest("hex");
  return `t=${timestamp},v1=${digest}`;
}

export function generatePortalRsaSignature(
  payload: string,
  privateKey: string | Buffer,
  timestamp: number = Math.floor(Date.now() / 1000),
): string {
  const signature = crypto
    .sign("RSA-SHA256", Buffer.from(`${timestamp}.${payload}`), privateKey)
    .toString("base64url");
  return `t=${timestamp},v1=${signature}`;
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

  const fields = new Map<string, string>();
  for (const rawPart of signatureHeader.split(",")) {
    const separator = rawPart.indexOf("=");
    if (separator <= 0) continue;
    fields.set(rawPart.slice(0, separator).trim(), rawPart.slice(separator + 1).trim());
  }

  const timestampStr = fields.get("t");
  const signatureValue = fields.get("v1");
  if (!timestampStr || !signatureValue || !/^\d+$/.test(timestampStr)) {
    throw new AppError("Malformed integration signature header", 401, "UNAUTHORIZED");
  }

  const timestamp = Number(timestampStr);
  if (!Number.isSafeInteger(timestamp)) {
    throw new AppError("Invalid timestamp in integration signature", 401, "UNAUTHORIZED");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > maxSkewSeconds) {
    throw new AppError("Integration signature timestamp expired or skewed", 401, "UNAUTHORIZED");
  }

  const key = keyResolver(fields.get("kid") || "default");
  if (!key) {
    throw new AppError("Integration signing key is not configured", 500, "INTERNAL_ERROR");
  }

  const signedPayload = Buffer.from(`${timestamp}.${payload}`);
  let valid = false;

  if (key.includes("-----BEGIN PUBLIC KEY-----")) {
    try {
      const signature = Buffer.from(signatureValue, "base64url");
      valid = signature.length > 0 && crypto.verify("RSA-SHA256", signedPayload, key, signature);
    } catch {
      valid = false;
    }
  } else {
    // HMAC is intentionally retained for existing unit tests and local development.
    // Production routes must configure a public PEM key and never a shared HMAC secret.
    if (!/^[a-f0-9]{64}$/i.test(signatureValue)) {
      throw new AppError("Invalid integration signature", 401, "UNAUTHORIZED");
    }
    const expected = crypto.createHmac("sha256", key).update(signedPayload).digest();
    const actual = Buffer.from(signatureValue, "hex");
    valid = actual.length === expected.length && crypto.timingSafeEqual(expected, actual);
  }

  if (!valid) {
    throw new AppError("Invalid integration signature", 401, "UNAUTHORIZED");
  }

  cleanReplayCache(Date.now(), maxSkewSeconds * 1000);
  if (seenSignatures.has(signatureValue)) {
    throw new AppError("Replay detected for integration signature", 401, "UNAUTHORIZED");
  }
  seenSignatures.set(signatureValue, Date.now());

  return { valid: true, timestamp };
}

export function clearReplayCacheForTesting(): void {
  seenSignatures.clear();
}
