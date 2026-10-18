/*
 * billing.test.ts
 * Unit tests for billing plans, entitlements, Razorpay signatures, and webhooks.
 * Asserts plan limits, signature rejection, replay prevention, and idempotency.
 */

import { describe, it, expect, beforeEach } from "vitest";
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
});
