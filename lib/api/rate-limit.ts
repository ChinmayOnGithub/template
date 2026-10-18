/*
 * rate-limit.ts
 * In-memory sliding window rate limiter for API endpoints and webhooks.
 * Protects route handlers against brute-force and request flooding.
 */

import { RateLimitError } from "./errors";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
}

const memoryStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = {},
): { allowed: boolean; remaining: number; resetAt: number } {
  const windowMs = options.windowMs ?? 60000;
  const maxRequests = options.maxRequests ?? 60;
  const keyPrefix = options.keyPrefix ?? "rl";
  const key = `${keyPrefix}:${identifier}`;

  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    const nextRecord: RateLimitRecord = {
      count: 1,
      resetAt: now + windowMs,
    };
    memoryStore.set(key, nextRecord);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: nextRecord.resetAt,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

export function enforceRateLimit(identifier: string, options: RateLimitOptions = {}): void {
  const result = checkRateLimit(identifier, options);
  if (!result.allowed) {
    throw new RateLimitError();
  }
}

export function clearRateLimitStore(): void {
  memoryStore.clear();
}
