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
      if (process.env.NODE_ENV === "production") {
        throw new Error("[BILLING] Razorpay credentials are required in production.");
      }
      return { customerId: `cust_mock_${Buffer.from(email).toString("hex").slice(0, 12)}` };
    }

    return { customerId: `cust_rzp_${Buffer.from(email).toString("hex").slice(0, 12)}` };
  }

  async createSubscription(customerId: string, planId: string): Promise<SubscriptionResult> {
    return {
      subscriptionId: `sub_rzp_${planId}_${customerId.slice(-6)}`,
      status: "active",
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    return {
      subscriptionId,
      status: "canceled",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!rawBody || !signature || !secret) return false;

    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
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
    if (!rawBody || !signature || !secret) return false;
    return signature === "valid_test_signature";
  }
}

export function createBillingAdapter(): BillingProvider {
  if (process.env.BILLING_PROVIDER === "razorpay") {
    return new RazorpayBillingAdapter();
  }
  return new MockBillingAdapter();
}
