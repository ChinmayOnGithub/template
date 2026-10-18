/*
 * webhook.ts
 * Idempotent webhook event processor with signature verification and replay prevention.
 * Handles payment and subscription lifecycle webhooks safely with database deduplication.
 */

import { BadRequestError, UnauthorizedError } from "../api/errors";
import { BillingProvider } from "./adapter";
import { db, isDatabaseConfigured } from "@/lib/db";

export interface WebhookPayload {
  id?: string;
  event?: string;
  payload?: {
    subscription?: {
      id?: string;
      customer_id?: string;
      plan_id?: string;
      status?: string;
    };
    payment?: {
      id?: string;
      amount?: number;
      currency?: string;
    };
  };
}

export interface ProcessWebhookResult {
  success: boolean;
  duplicate: boolean;
  eventId: string;
  eventType: string;
}

const processedEventStore = new Set<string>();

export async function processBillingWebhook(
  rawBody: string,
  signature: string | null,
  webhookSecret: string,
  provider: BillingProvider,
): Promise<ProcessWebhookResult> {
  if (!signature) {
    throw new UnauthorizedError("Missing webhook signature header.");
  }

  // 1. Verify signature
  const isValid = provider.verifyWebhookSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    throw new UnauthorizedError("Invalid webhook signature.");
  }

  // 2. Parse payload safely
  let parsed: WebhookPayload;
  try {
    parsed = JSON.parse(rawBody) as WebhookPayload;
  } catch {
    throw new BadRequestError("Invalid JSON payload in webhook body.");
  }

  const eventId = parsed.id || `evt_${Date.now()}`;
  const eventType = parsed.event || "unknown.event";

  // 3. Deduplicate events via durable database if available
  if (isDatabaseConfigured()) {
    try {
      const existing = await db.webhookEvent.findUnique({
        where: { eventId },
      });
      if (existing) {
        return {
          success: true,
          duplicate: true,
          eventId,
          eventType,
        };
      }
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `[BILLING WEBHOOK] Database deduplication check failed in production: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  } else if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[BILLING WEBHOOK] Database persistence is required for webhook deduplication in production.",
    );
  }

  // Deduplicate in memory
  if (processedEventStore.has(eventId)) {
    return {
      success: true,
      duplicate: true,
      eventId,
      eventType,
    };
  }

  // 4. Dispatch business events with transactional persistence
  const subData = parsed.payload?.subscription as Record<string, unknown> | undefined;
  const subEntity = (subData?.entity || subData) as
    | { id?: string; plan_id?: string; status?: string }
    | undefined;
  const subId = subEntity?.id;
  const planId = subEntity?.plan_id;

  if (isDatabaseConfigured()) {
    try {
      await db.$transaction(async (tx) => {
        await tx.webhookEvent.create({
          data: {
            provider: "billing",
            eventId,
            eventType,
            payload: (parsed as unknown as object) || {},
            status: "processed",
          },
        });

        if (subId) {
          let newStatus: "active" | "canceled" | "past_due" = "active";
          let cancelAtPeriodEnd = false;

          if (eventType === "subscription.cancelled") {
            newStatus = "canceled";
            cancelAtPeriodEnd = true;
          } else if (eventType === "payment.failed") {
            newStatus = "past_due";
          }

          const existingSub = await tx.subscription.findUnique({
            where: { providerSubscriptionId: subId },
          });

          if (existingSub) {
            await tx.subscription.update({
              where: { providerSubscriptionId: subId },
              data: {
                status: newStatus,
                cancelAtPeriodEnd,
                ...(planId ? { planId } : {}),
              },
            });
          }
        }
      });
    } catch (err: unknown) {
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        return {
          success: true,
          duplicate: true,
          eventId,
          eventType,
        };
      }
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `[BILLING WEBHOOK] Transaction failed in production: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }

  // 5. Mark as processed in local memory store
  processedEventStore.add(eventId);

  return {
    success: true,
    duplicate: false,
    eventId,
    eventType,
  };
}

export function clearProcessedWebhookStore(): void {
  processedEventStore.clear();
}
