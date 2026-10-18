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

export function assertBillingProviderConfigured(
  environment = process.env.NODE_ENV,
  provider = process.env.BILLING_PROVIDER,
): void {
  if (environment === "production" && provider?.toLowerCase() !== "razorpay") {
    throw new Error("BILLING_PROVIDER=razorpay must be explicitly configured in production.");
  }
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

  async createCustomer(email: string, name?: string): Promise<CustomerResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are required to create a customer.",
      );
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
    const res = await fetch("https://api.razorpay.com/v1/customers", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, ...(name ? { name } : {}) }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Razorpay customer creation failed (${res.status}): ${err}`);
    }

    const json = (await res.json()) as { id: string };
    return { customerId: json.id };
  }

  async createSubscription(customerId: string, planId: string): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are required to create a subscription.",
      );
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: planId,
        customer_id: customerId,
        total_count: 12,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Razorpay subscription creation failed (${res.status}): ${err}`);
    }

    const json = (await res.json()) as {
      id: string;
      status: "active" | "trialing" | "past_due" | "canceled" | "unpaid";
    };
    return {
      subscriptionId: json.id,
      status: json.status,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error(
        "Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are required to cancel a subscription.",
      );
    }

    const authHeader = `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64")}`;
    const res = await fetch(`https://api.razorpay.com/v1/subscriptions/${subscriptionId}/cancel`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cancel_at_cycle_end: 0 }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Razorpay subscription cancellation failed (${res.status}): ${err}`);
    }

    const json = (await res.json()) as { id: string };
    return {
      subscriptionId: json.id,
      status: "canceled",
    };
  }

  verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
    if (!rawBody || !signature || !secret || !/^[a-f0-9]{64}$/i.test(signature)) return false;

    const expectedSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    return (
      sigBuffer.length === expectedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, expectedBuffer)
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

  verifyWebhookSignature(_rawBody: string, _signature: string, _secret: string): boolean {
    // The mock adapter never authenticates webhook signatures, including in development.
    return false;
  }
}

export function createBillingAdapter(): BillingProvider {
  const provider = process.env.BILLING_PROVIDER?.toLowerCase();
  assertBillingProviderConfigured(process.env.NODE_ENV, provider);

  if (provider === "razorpay") {
    return new RazorpayBillingAdapter();
  }

  if (provider && provider !== "mock") {
    throw new Error(`Unsupported BILLING_PROVIDER: ${provider}`);
  }

  return new MockBillingAdapter();
}
