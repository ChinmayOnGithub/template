/*
 * billing.test.ts
 * Unit tests for billing plans, entitlements, Razorpay signatures, and webhooks.
 * Asserts plan limits, signature rejection, replay prevention, and idempotency.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import crypto from "node:crypto";
import {
  getPlan,
  checkFeatureAccess,
  assertFeatureEnabled,
  assertWithinUsageLimit,
  RazorpayBillingAdapter,
  processBillingWebhook,
  clearProcessedWebhookStore,
} from "../lib/billing";
import { ForbiddenError, UnauthorizedError } from "../lib/api/errors";

describe("Billing Plans & Entitlements", () => {
  it("returns correct limits for free tier", () => {
    const plan = getPlan("free");
    expect(plan.id).toBe("free");
    expect(plan.features.maxProjects).toBe(3);
    expect(plan.features.customDomain).toBe(false);
  });

  it("permits features enabled on pro tier and restricts on free tier", () => {
    expect(checkFeatureAccess("pro", "customDomain")).toBe(true);
    expect(checkFeatureAccess("free", "customDomain")).toBe(false);

    expect(() => assertFeatureEnabled("free", "customDomain")).toThrow(ForbiddenError);
    expect(() => assertFeatureEnabled("pro", "customDomain")).not.toThrow();
  });

  it("enforces numeric usage limits based on plan tier", () => {
    expect(() => assertWithinUsageLimit("free", "maxProjects", 2, 1)).not.toThrow();
    // Exceeds free limit of 3
    expect(() => assertWithinUsageLimit("free", "maxProjects", 3, 1)).toThrow(ForbiddenError);
    // Pro limit of 50 allows 4
    expect(() => assertWithinUsageLimit("pro", "maxProjects", 3, 1)).not.toThrow();
  });
});

describe("Razorpay Signature Verification", () => {
  const secret = "test_webhook_secret_key_123";
  const adapter = new RazorpayBillingAdapter("rzp_test_key", "rzp_test_secret");

  it("validates correct HMAC-SHA256 signature against raw body", () => {
    const rawBody = JSON.stringify({ id: "evt_123", event: "subscription.charged" });
    const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const result = adapter.verifyWebhookSignature(rawBody, validSignature, secret);
    expect(result).toBe(true);
  });

  it("rejects tampered body or invalid signature", () => {
    const rawBody = JSON.stringify({ id: "evt_123", event: "subscription.charged" });
    const invalidSignature = "tampered_signature_hex_value";

    const result = adapter.verifyWebhookSignature(rawBody, invalidSignature, secret);
    expect(result).toBe(false);
  });
});

describe("Webhook Deduplication & Replay Prevention", () => {
  const secret = "test_webhook_secret_key_123";
  const adapter = new RazorpayBillingAdapter("rzp_test_key", "rzp_test_secret");

  beforeEach(() => {
    clearProcessedWebhookStore();
  });

  it("processes first arrival and flags subsequent arrivals as duplicates", async () => {
    const rawBody = JSON.stringify({ id: "evt_dup_999", event: "subscription.activated" });
    const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const first = await processBillingWebhook(rawBody, signature, secret, adapter);
    expect(first.success).toBe(true);
    expect(first.duplicate).toBe(false);
    expect(first.eventId).toBe("evt_dup_999");

    // Second execution with same eventId
    const second = await processBillingWebhook(rawBody, signature, secret, adapter);
    expect(second.success).toBe(true);
    expect(second.duplicate).toBe(true);
    expect(second.eventId).toBe("evt_dup_999");
  });

  it("throws UnauthorizedError when signature header is missing or invalid", async () => {
    const rawBody = JSON.stringify({ id: "evt_1" });
    await expect(processBillingWebhook(rawBody, null, secret, adapter)).rejects.toThrow(
      UnauthorizedError,
    );

    await expect(processBillingWebhook(rawBody, "invalid_sig", secret, adapter)).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it("handles subscription lifecycle events: activated, failed payment, cancelled", async () => {
    const events = [
      { id: "evt_sub_act", event: "subscription.activated", subId: "sub_rzp_001" },
      { id: "evt_pay_fail", event: "payment.failed", subId: "sub_rzp_001" },
      { id: "evt_sub_canc", event: "subscription.cancelled", subId: "sub_rzp_001" },
    ];

    for (const item of events) {
      const rawBody = JSON.stringify({
        id: item.id,
        event: item.event,
        payload: {
          subscription: {
            entity: {
              id: item.subId,
              plan_id: "plan_pro",
              status: item.event === "subscription.cancelled" ? "canceled" : "active",
            },
          },
        },
      });
      const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
      const res = await processBillingWebhook(rawBody, signature, secret, adapter);
      expect(res.success).toBe(true);
      expect(res.duplicate).toBe(false);
      expect(res.eventId).toBe(item.id);
    }
  });

  it("fails closed in production mode when database is unconfigured", async () => {
    const originalEnv = process.env.NODE_ENV;
    try {
      (process.env as Record<string, string | undefined>).NODE_ENV = "production";
      const rawBody = JSON.stringify({ id: "evt_prod_fail", event: "subscription.charged" });
      const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      await expect(processBillingWebhook(rawBody, signature, secret, adapter)).rejects.toThrow(
        /Database persistence is required/,
      );
    } finally {
      (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
    }
  });
});

describe("Razorpay REST API Client", () => {
  const originalFetch = globalThis.fetch;
  const adapter = new RazorpayBillingAdapter("rzp_key_123", "rzp_secret_456");

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("creates customer via /v1/customers with basic auth", async () => {
    let capturedUrl = "";
    let capturedMethod = "";
    let capturedAuth = "";

    globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = input.toString();
      capturedMethod = init?.method || "";
      capturedAuth = (init?.headers as Record<string, string>)?.Authorization || "";

      return new Response(JSON.stringify({ id: "cust_rzp_test_999" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const res = await adapter.createCustomer("user@example.com", "Test User");
    expect(res.customerId).toBe("cust_rzp_test_999");
    expect(capturedUrl).toBe("https://api.razorpay.com/v1/customers");
    expect(capturedMethod).toBe("POST");
    expect(capturedAuth).toBe(
      `Basic ${Buffer.from("rzp_key_123:rzp_secret_456").toString("base64")}`,
    );
  });

  it("creates subscription via /v1/subscriptions with plan_id and customer_id", async () => {
    let capturedBody = "";

    globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      capturedBody = init?.body?.toString() || "";
      return new Response(JSON.stringify({ id: "sub_rzp_test_888", status: "active" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const res = await adapter.createSubscription("cust_rzp_test_999", "plan_pro_yearly");
    expect(res.subscriptionId).toBe("sub_rzp_test_888");
    expect(res.status).toBe("active");
    expect(capturedBody).toContain("plan_pro_yearly");
    expect(capturedBody).toContain("cust_rzp_test_999");
  });

  it("cancels subscription via /v1/subscriptions/:id/cancel", async () => {
    let capturedUrl = "";

    globalThis.fetch = async (input: RequestInfo | URL) => {
      capturedUrl = input.toString();
      return new Response(JSON.stringify({ id: "sub_rzp_test_888", status: "canceled" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };

    const res = await adapter.cancelSubscription("sub_rzp_test_888");
    expect(res.subscriptionId).toBe("sub_rzp_test_888");
    expect(res.status).toBe("canceled");
    expect(capturedUrl).toBe("https://api.razorpay.com/v1/subscriptions/sub_rzp_test_888/cancel");
  });

  it("throws clear error when credentials are not configured", async () => {
    const unconfiguredAdapter = new RazorpayBillingAdapter("", "");
    await expect(unconfiguredAdapter.createCustomer("user@example.com")).rejects.toThrow(
      /Razorpay credentials/,
    );
    await expect(unconfiguredAdapter.createSubscription("cust_1", "plan_1")).rejects.toThrow(
      /Razorpay credentials/,
    );
    await expect(unconfiguredAdapter.cancelSubscription("sub_1")).rejects.toThrow(
      /Razorpay credentials/,
    );
  });
});
