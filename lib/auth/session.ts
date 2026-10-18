/*
 * session.ts
 * Cryptographic session token generation, verification, and expiration handling.
 * Enforces stateless HMAC-SHA256 session integrity using configured secret.
 */

import crypto from "node:crypto";

export interface SessionUser {
  userId: string;
  email: string;
  role: "admin" | "member" | "guest";
  exp: number;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("[AUTH] AUTH_SECRET environment variable is required in production.");
    }
    return "dev_fallback_secret_must_not_be_used_in_production_32b";
  }
  return secret;
}

export function createSessionToken(user: Omit<SessionUser, "exp">, ttlSeconds = 86400 * 7): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload: SessionUser = { ...user, exp };
  const rawPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(rawPayload)
    .digest("base64url");

  return `${rawPayload}.${signature}`;
}

export function verifySessionToken(token: string | null | undefined): SessionUser | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const rawPayload = parts[0];
  const signature = parts[1];
  if (!rawPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", getAuthSecret())
    .update(rawPayload)
    .digest("base64url");

  // Constant-time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (
    sigBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(rawPayload, "base64url").toString("utf8"),
    ) as SessionUser;
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export function getSessionFromHeaders(headers: Headers): SessionUser | null {
  const authHeader = headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.slice(7).trim());
  }

  const cookieHeader = headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)session=([^;]+)/);
    if (match) {
      return verifySessionToken(match[1]);
    }
  }

  return null;
}
