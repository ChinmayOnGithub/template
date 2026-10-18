/*
 * route.ts
 * Next.js App Router POST handler for billing and payment webhooks.
 * Receives raw webhook payloads, verifies provider signatures, and handles deduplication.
 */

import { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { createBillingAdapter, processBillingWebhook } from "@/lib/billing";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  const signature =
    req.headers.get("x-razorpay-signature") ||
    req.headers.get("stripe-signature") ||
    req.headers.get("x-webhook-signature");

  const secret = process.env.BILLING_WEBHOOK_SECRET || "default_webhook_secret_dev";
  const adapter = createBillingAdapter();

  try {
    const rawBody = await req.text();
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
