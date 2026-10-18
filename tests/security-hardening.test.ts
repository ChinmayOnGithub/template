/*
 * security-hardening.test.ts
 * Regression tests for production credential fail-closed behavior and portal signatures.
 * Prevents unsafe mock authentication and cleartext service-to-service requests.
 */

import crypto from "node:crypto";
import { beforeEach, describe, expect, it } from "vitest";
import { assertBillingProviderConfigured, MockBillingAdapter } from "../lib/billing/adapter";
import {
  clearReplayCacheForTesting,
  generatePortalRsaSignature,
  verifyPortalSignature,
} from "../lib/saas-integration/auth";
import { validatePortalBaseUrl } from "../lib/saas-integration/client";
import { generateDevelopmentSecret } from "../lib/config/env";

describe("production security configuration", () => {
  it("generates cryptographically secure 64-character hex development secrets", () => {
    const sec1 = generateDevelopmentSecret();
    const sec2 = generateDevelopmentSecret();
    expect(sec1).toHaveLength(64);
    expect(sec2).toHaveLength(64);
    expect(sec1).not.toBe(sec2);
    expect(/^[0-9a-f]{64}$/.test(sec1)).toBe(true);
  });

  it("refuses to select a mock billing provider in production", () => {
    expect(() => assertBillingProviderConfigured("production", "mock")).toThrow(
      /must be explicitly configured/,
    );
    expect(() => assertBillingProviderConfigured("production", undefined)).toThrow(
      /must be explicitly configured/,
    );
  });

  it("does not accept mock webhook signatures", () => {
    const adapter = new MockBillingAdapter();
    expect(adapter.verifyWebhookSignature("{}", "valid_test_signature", "configured-secret")).toBe(
      false,
    );
  });

  it("requires HTTPS for the Admin Portal client in production", () => {
    expect(() => validatePortalBaseUrl("http://portal.example.com", "production")).toThrow(
      /requires HTTPS/,
    );
    expect(validatePortalBaseUrl("http://localhost:4000", "test").hostname).toBe("localhost");
  });
});

describe("asymmetric portal signatures", () => {
  beforeEach(() => {
    clearReplayCacheForTesting();
  });

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
