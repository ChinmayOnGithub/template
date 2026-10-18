/*
 * route.ts
 * Next.js App Router POST handler for billing and payment webhooks.
 * Receives raw webhook payloads and fails closed when provider secrets are absent.
 */

import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { createBillingAdapter, processBillingWebhook } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const secret = process.env.BILLING_WEBHOOK_SECRET;
    if (!secret) {
      // Misconfiguration must not silently downgrade webhook authentication.
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
