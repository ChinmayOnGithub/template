/*
 * idempotency.ts
 * Idempotency verification and cached mutation result tracking.
 * Prevents duplicate processing of critical payments, mutations, and webhooks.
 */

import { ConflictError } from "./errors";

interface IdempotencyRecord {
  status: "processing" | "completed";
  responseStatus?: number;
  responseBody?: unknown;
  expiresAt: number;
}

const idempotencyStore = new Map<string, IdempotencyRecord>();

export async function withIdempotency<T>(
  key: string | null | undefined,
  ttlMs = 86400000,
  action: () => Promise<T>,
): Promise<T> {
  if (!key) {
    return action();
  }

  const now = Date.now();
  const existing = idempotencyStore.get(key);

  if (existing) {
    if (existing.expiresAt < now) {
      idempotencyStore.delete(key);
    } else if (existing.status === "processing") {
      throw new ConflictError("Operation is already being processed. Please retry shortly.");
    } else if (existing.status === "completed") {
      return existing.responseBody as T;
    }
  }

  idempotencyStore.set(key, {
    status: "processing",
    expiresAt: now + ttlMs,
  });

  try {
    const result = await action();
    idempotencyStore.set(key, {
      status: "completed",
      responseBody: result,
      expiresAt: now + ttlMs,
    });
    return result;
  } catch (error) {
    idempotencyStore.delete(key);
    throw error;
  }
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}
