/*
 * adapter.ts
 * Provider-neutral billing interface and reference Razorpay adapter implementation.
 * Abstracts subscription lifecycle, payment verification, and webhook signature validation.
 */

import crypto from "node:crypto";

export interface CustomerResult {
  customerId: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
}

export interface BillingProvider {
  createCustomer: (email: string, name?: string) => Promise<CustomerResult>;
  createSubscription: (customerId: string, planId: string) => Promise<SubscriptionResult>;
  cancelSubscription: (subscriptionId: string) => Promise<SubscriptionResult>;
  verifyWebhookSignature: (rawBody: string, signature: string, secret: string) => boolean;
}

export class RazorpayBillingAdapter implements BillingProvider {
  private keyId: string;
  private keySecret: string;

  constructor(
    keyId = process.env.RAZORPAY_KEY_ID || "",
    keySecret = process.env.RAZORPAY_KEY_SECRET || "",
  ) {
    this.keyId = keyId;
    this.keySecret = keySecret;
  }

  async createCustomer(email: string, _name?: string): Promise<CustomerResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials are required to create a customer.");
    }

    // This adapter currently supplies deterministic reference IDs only. Replace with the
    // provider API integration before enabling live customer/subscription operations.
    return {
      customerId: `cust_rzp_${Buffer.from(email).toString("hex").slice(0, 12)}`,
    };
  }

  async createSubscription(customerId: string, planId: string): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials are required to create a subscription.");
    }
    throw new Error(
      `Razorpay subscription API integration is not implemented (customer=${customerId}, plan=${planId}).`,
    );
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials are required to cancel a subscription.");
    }
    throw new Error(
      `Razorpay cancellation API integration is not implemented (subscription=${subscriptionId}).`,
    );
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!rawBody || !signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;

    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    return (
      sigBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(sigBuffer, expectedBuffer)
    );
  }
}

export class MockBillingAdapter implements BillingProvider {
  async createCustomer(email: string): Promise<CustomerResult> {
    return { customerId: `cust_test_${Buffer.from(email).toString("hex").slice(0, 8)}` };
  }

  async createSubscription(_customerId: string, planId: string): Promise<SubscriptionResult> {
    return { subscriptionId: `sub_test_${planId}`, status: "active" };
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    return { subscriptionId, status: "canceled" };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    // A test adapter must never be a production authentication mechanism.
    return (
      process.env.NODE_ENV !== "production" &&
      Boolean(rawBody && secret) &&
      signature === "valid_test_signature"
    );
  }
}

export function createBillingAdapter(): BillingProvider {
  const provider = process.env.BILLING_PROVIDER?.toLowerCase();

  if (provider === "razorpay") {
    return new RazorpayBillingAdapter();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BILLING_PROVIDER=razorpay must be explicitly configured in production.");
  }

  if (provider && provider !== "mock") {
    throw new Error(`Unsupported BILLING_PROVIDER: ${provider}`);
  }

  return new MockBillingAdapter();
}
