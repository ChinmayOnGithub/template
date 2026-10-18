/*
 * worker.ts
 * Background worker and dispatcher for processing durable Admin Portal events.
 * Executes domain mutations, monotonic entitlement sync, and failure recovery.
 */

import { db, isDatabaseConfigured } from "@/server/db";
import { logger } from "@/lib/observability/logger";
import { defaultEntitlementManager } from "./entitlements";
import type { Prisma } from "@prisma/client";

export type PortalEventHandler = (
  payload: Record<string, unknown>,
  eventId: string,
) => Promise<void> | void;

const eventHandlers = new Map<string, PortalEventHandler>();

// Register core handlers for Admin Portal event capabilities
eventHandlers.set("entitlements.sync", async (payload) => {
  if (payload.snapshot) {
    defaultEntitlementManager.applySnapshot(payload.snapshot);
  }
});

eventHandlers.set("tenant.suspended", async (payload) => {
  logger.warn("Tenant suspended by Admin Portal command", { payload });
});

eventHandlers.set("tenant.restored", async (payload) => {
  logger.info("Tenant restored by Admin Portal command", { payload });
});

eventHandlers.set("user.deprovisioned", async (payload) => {
  const email = (payload.email as string) || undefined;
  const userId = (payload.userId as string) || undefined;
  if (isDatabaseConfigured() && (userId || email)) {
    try {
      await db.user.updateMany({
        where: {
          OR: [...(userId ? [{ id: userId }] : []), ...(email ? [{ email }] : [])],
        },
        data: {
          status: "suspended",
        },
      });
    } catch (err: unknown) {
      logger.error("Failed to suspend user during deprovisioning command", {
        error: (err as Error).message,
        userId,
        email,
      });
      throw err;
    }
  }
});

export function registerPortalEventHandler(eventType: string, handler: PortalEventHandler): void {
  eventHandlers.set(eventType, handler);
}

export function clearPortalEventHandlers(): void {
  eventHandlers.clear();
}

export interface ProcessEventResult {
  success: boolean;
  eventId: string;
  eventType: string;
  processedAt: string;
  error?: string;
}

export async function processInboundPortalEvent(event: {
  id?: string;
  eventId: string;
  eventType: string;
  payload: unknown;
}): Promise<ProcessEventResult> {
  const { eventId, eventType, payload } = event;
  const handler = eventHandlers.get(eventType);

  try {
    if (handler) {
      await handler((payload as Record<string, unknown>) || {}, eventId);
    } else {
      logger.info(
        `No custom handler registered for portal event type "${eventType}". Accepted as no-op.`,
        {
          eventId,
        },
      );
    }

    const processedAt = new Date().toISOString();

    if (isDatabaseConfigured()) {
      await db.webhookEvent.updateMany({
        where: { eventId, provider: "admin_portal" },
        data: {
          status: "completed",
          processedAt: new Date(processedAt),
        },
      });
    }

    return {
      success: true,
      eventId,
      eventType,
      processedAt,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    logger.error("Failed to process inbound portal event", {
      eventId,
      eventType,
      error: errorMsg,
    });

    if (isDatabaseConfigured()) {
      try {
        await db.webhookEvent.updateMany({
          where: { eventId, provider: "admin_portal" },
          data: {
            status: "failed",
            payload: {
              ...((payload as Record<string, unknown>) || {}),
              lastError: errorMsg,
              failedAt: new Date().toISOString(),
            } as Prisma.InputJsonValue,
          },
        });
      } catch (dbErr) {
        logger.error("Failed to record event failure status to database", {
          error: (dbErr as Error).message,
        });
      }
    }

    return {
      success: false,
      eventId,
      eventType,
      processedAt: new Date().toISOString(),
      error: errorMsg,
    };
  }
}

export async function processPendingPortalEvents(limit = 10): Promise<{
  processedCount: number;
  results: ProcessEventResult[];
}> {
  if (!isDatabaseConfigured()) {
    return { processedCount: 0, results: [] };
  }

  const pendingEvents = await db.webhookEvent.findMany({
    where: {
      provider: "admin_portal",
      status: "accepted",
    },
    take: limit,
    orderBy: { createdAt: "asc" },
  });

  const results: ProcessEventResult[] = [];
  for (const event of pendingEvents) {
    const result = await processInboundPortalEvent({
      id: event.id,
      eventId: event.eventId,
      eventType: event.eventType,
      payload: event.payload,
    });
    results.push(result);
  }

  return {
    processedCount: results.filter((r) => r.success).length,
    results,
  };
}
