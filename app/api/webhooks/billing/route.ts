/*
 * route.ts
 * Next.js App Router POST handler for billing and payment webhooks.
 * Fails closed until durable idempotency and real billing lifecycle handlers are configured.
 */

import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { createBillingAdapter, processBillingWebhook } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (process.env.NODE_ENV === "production") {
      // The current webhook processor uses process-local state and placeholder handlers.
      // Do not acknowledge a provider event that cannot be durably recorded and applied.
      return apiError(
        "Billing webhooks are disabled until durable idempotency and lifecycle handlers are configured.",
        503,
      );
    }

    const secret = process.env.BILLING_WEBHOOK_SECRET;
    if (!secret) {
      return apiError("Billing webhook authentication is not configured.", 503);
    }

    const signature =
      req.headers.get("x-razorpay-signature") ||
      req.headers.get("stripe-signature") ||
      req.headers.get("x-webhook-signature");

    const rawBody = await req.text();
    const adapter = createBillingAdapter();
    const result = await processBillingWebhook(rawBody, signature, secret, adapter);

    return apiSuccess({
      received: true,
      eventId: result.eventId,
      duplicate: result.duplicate,
    });
  } catch (error) {
    return apiError(error);
  }
}
