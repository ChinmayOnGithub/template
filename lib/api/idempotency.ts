/*
 * idempotency.ts
 * Idempotency verification and cached mutation result tracking.
 * Prevents duplicate processing of critical payments, mutations, and webhooks with database persistence.
 */

import { ConflictError } from "./errors";
import { db, isDatabaseConfigured } from "@/lib/db";

interface MemoryRecord {
  status: "processing" | "completed";
  responseStatus?: number;
  responseBody?: unknown;
  expiresAt: number;
}

const idempotencyStore = new Map<string, MemoryRecord>();

export async function withIdempotency<T>(
  key: string | null | undefined,
  ttlMs = 86400000,
  action: () => Promise<T>,
): Promise<T> {
  if (!key) {
    return action();
  }

  const now = Date.now();
  const expiresAt = new Date(now + ttlMs);

  // 1. If database is available, use durable persistence
  if (isDatabaseConfigured()) {
    try {
      const existing = await db.idempotencyRecord.findUnique({
        where: { key },
      });

      if (existing) {
        if (existing.expiresAt.getTime() < now) {
          await db.idempotencyRecord.delete({ where: { key } }).catch(() => {});
        } else if (existing.responseStatus === 102) {
          // HTTP 102 Processing marker
          throw new ConflictError("Operation is already being processed. Please retry shortly.");
        } else if (existing.responseStatus >= 200 && existing.responseStatus < 300) {
          return existing.responseBody as T;
        }
      }

      // Reserve key atomically
      await db.idempotencyRecord.create({
        data: {
          key,
          handler: "default",
          responseStatus: 102, // Processing
          expiresAt,
        },
      });
    } catch (err: unknown) {
      if (err instanceof ConflictError) throw err;
      // If unique constraint violation occurred concurrently
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        throw new ConflictError("Operation is already being processed. Please retry shortly.");
      }
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `[IDEMPOTENCY] Durable reservation failed in production: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[IDEMPOTENCY] Durable database persistence is required for idempotency in production.",
    );
  }

  // 2. Memory store check
  const existingMem = idempotencyStore.get(key);
  if (existingMem) {
    if (existingMem.expiresAt < now) {
      idempotencyStore.delete(key);
    } else if (existingMem.status === "processing") {
      throw new ConflictError("Operation is already being processed. Please retry shortly.");
    } else if (existingMem.status === "completed") {
      return existingMem.responseBody as T;
    }
  }

  idempotencyStore.set(key, {
    status: "processing",
    expiresAt: now + ttlMs,
  });

  try {
    const result = await action();

    // Update memory
    idempotencyStore.set(key, {
      status: "completed",
      responseBody: result,
      expiresAt: now + ttlMs,
    });

    // Update durable database record if available
    if (isDatabaseConfigured()) {
      await db.idempotencyRecord
        .update({
          where: { key },
          data: {
            responseStatus: 200,
            responseBody: (result as unknown as object) || undefined,
          },
        })
        .catch(() => {});
    }

    return result;
  } catch (error) {
    idempotencyStore.delete(key);
    if (isDatabaseConfigured()) {
      await db.idempotencyRecord.delete({ where: { key } }).catch(() => {});
    }
    throw error;
  }
}

export function clearIdempotencyStore(): void {
  idempotencyStore.clear();
}
