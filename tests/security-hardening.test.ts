/*
 * security-hardening.test.ts
 * Regression tests for production credential fail-closed behavior and portal signatures.
 * Prevents unsafe mock authentication and cleartext service-to-service requests.
 */

import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { createBillingAdapter, MockBillingAdapter } from "../lib/billing/adapter";
import {
  clearReplayCacheForTesting,
  generatePortalRsaSignature,
  verifyPortalSignature,
} from "../lib/saas-integration/auth";
import { AdminPortalClient } from "../lib/saas-integration/client";

const originalNodeEnv = process.env.NODE_ENV;
const originalBillingProvider = process.env.BILLING_PROVIDER;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalBillingProvider === undefined) delete process.env.BILLING_PROVIDER;
  else process.env.BILLING_PROVIDER = originalBillingProvider;
  clearReplayCacheForTesting();
});

describe("production security configuration", () => {
  it("refuses to silently select a mock billing provider in production", () => {
    process.env.NODE_ENV = "production";
    delete process.env.BILLING_PROVIDER;
    expect(() => createBillingAdapter()).toThrow(/must be explicitly configured/);
  });

  it("does not accept the mock webhook signature in production", () => {
    process.env.NODE_ENV = "production";
    const adapter = new MockBillingAdapter();
    expect(
      adapter.verifyWebhookSignature("{}", "valid_test_signature", "configured-secret"),
    ).toBe(false);
  });

  it("requires HTTPS for the Admin Portal client in production", () => {
    process.env.NODE_ENV = "production";
    expect(
      () =>
        new AdminPortalClient({
          baseUrl: "http://portal.example.com",
          clientId: "test-client",
          clientSecret: "test-secret",
        }),
    ).toThrow(/requires HTTPS/);
  });
});

describe("asymmetric portal signatures", () => {
  it("verifies RSA-SHA256 signatures and rejects modified payloads", () => {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const payload = JSON.stringify({ eventId: "evt-rsa-1", action: "sync" });
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = generatePortalRsaSignature(payload, privateKey, timestamp);

    expect(
      verifyPortalSignature({
        signatureHeader: signature,
        payload,
        keyResolver: () => publicKey,
      }).valid,
    ).toBe(true);

    clearReplayCacheForTesting();
    expect(() =>
      verifyPortalSignature({
        signatureHeader: signature,
        payload: payload + " ",
        keyResolver: () => publicKey,
      }),
    ).toThrow(/Invalid integration signature/);
  });
});
