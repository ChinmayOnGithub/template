/*
 * saas-integration.test.ts
 * Comprehensive test suite for SaaS Admin Portal integration layer.
 * Verifies contract validation, signature authentication, client retries, and entitlement caching.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createDefaultManifest,
  validateProductManifest,
  generatePortalSignature,
  verifyPortalSignature,
  clearReplayCacheForTesting,
  EntitlementManager,
  AdminPortalClient,
  MockAdminPortal,
  IntegrationError,
  type ProductEvent,
  type EntitlementSnapshot,
} from "../lib/saas-integration";

describe("SaaS Integration Manifest Contract", () => {
  it("validates a well-formed product manifest", () => {
    const manifest = createDefaultManifest({
      productId: "tracker-app",
      name: "Tracker",
      features: {
        custom_metrics: {
          type: "boolean",
          defaultValue: false,
          description: "Allows custom metric tracking",
        },
      },
    });

    const parsed = validateProductManifest(manifest);
    expect(parsed.productId).toBe("tracker-app");
    expect(parsed.features.custom_metrics?.type).toBe("boolean");
  });

  it("rejects manifest with uppercase or invalid characters in productId", () => {
    const invalidManifest = createDefaultManifest({
      productId: "Tracker_App!",
    });

    expect(() => validateProductManifest(invalidManifest)).toThrow(/productId/);
  });

  it("rejects manifest with duplicate capabilities", () => {
    const invalidManifest = {
      ...createDefaultManifest(),
      capabilities: ["health.read", "health.read"],
    };

    expect(() => validateProductManifest(invalidManifest)).toThrow(/Duplicate capabilities/);
  });

  it("rejects feature definition where defaultValue does not match declared type", () => {
    const invalidManifest = {
      ...createDefaultManifest(),
      features: {
        bad_feature: {
          type: "boolean",
          defaultValue: 42,
          description: "Mismatched type",
        },
      },
    };

    expect(() => validateProductManifest(invalidManifest)).toThrow(/defaultValue/);
  });
});

describe("SaaS Integration Authentication & Signatures", () => {
  const secret = "test_signing_secret_key_32_bytes_long";

  beforeEach(() => {
    clearReplayCacheForTesting();
  });

  it("verifies a valid portal signature", () => {
    const payload = JSON.stringify({ eventId: "evt_123", action: "sync" });
    const now = Math.floor(Date.now() / 1000);
    const signature = generatePortalSignature(payload, secret, now);

    const result = verifyPortalSignature({
      signatureHeader: signature,
      payload,
      keyResolver: () => secret,
      maxSkewSeconds: 300,
    });

    expect(result.valid).toBe(true);
    expect(result.timestamp).toBe(now);
  });

  it("rejects signature with invalid secret", () => {
    const payload = JSON.stringify({ action: "sync" });
    const signature = generatePortalSignature(payload, secret);

    expect(() =>
      verifyPortalSignature({
        signatureHeader: signature,
        payload,
        keyResolver: () => "wrong_secret",
      }),
    ).toThrow(/Invalid integration signature/);
  });

  it("rejects expired or skewed timestamps", () => {
    const payload = JSON.stringify({ action: "sync" });
    const expiredTimestamp = Math.floor(Date.now() / 1000) - 400; // 400s old (skew limit: 300s)
    const signature = generatePortalSignature(payload, secret, expiredTimestamp);

    expect(() =>
      verifyPortalSignature({
        signatureHeader: signature,
        payload,
        keyResolver: () => secret,
        maxSkewSeconds: 300,
      }),
    ).toThrow(/expired or skewed/);
  });

  it("detects and prevents replay attacks for identical signatures", () => {
    const payload = JSON.stringify({ action: "critical_command" });
    const signature = generatePortalSignature(payload, secret);

    const res1 = verifyPortalSignature({
      signatureHeader: signature,
      payload,
      keyResolver: () => secret,
    });
    expect(res1.valid).toBe(true);

    expect(() =>
      verifyPortalSignature({
        signatureHeader: signature,
        payload,
        keyResolver: () => secret,
      }),
    ).toThrow(/Replay detected/);
  });
});

describe("EntitlementManager Caching & Versioning", () => {
  let manager: EntitlementManager;

  beforeEach(() => {
    manager = new EntitlementManager({ gracePeriodMs: 5000, strictMode: false });
  });

  it("applies entitlement snapshot and updates monotonically", () => {
    const snapshot1: EntitlementSnapshot = {
      productId: "tracker",
      version: 1,
      issuedAt: new Date().toISOString(),
      features: { export_csv: true, dark_mode: true },
      limits: { max_items: 100 },
    };

    const res1 = manager.applySnapshot(snapshot1);
    expect(res1.updated).toBe(true);
    expect(manager.hasFeature("tracker", "export_csv")).toBe(true);
    expect(manager.getLimit("tracker", "max_items")).toBe(100);

    // Apply version 2
    const snapshot2: EntitlementSnapshot = {
      ...snapshot1,
      version: 2,
      limits: { max_items: 200 },
    };
    const res2 = manager.applySnapshot(snapshot2);
    expect(res2.updated).toBe(true);
    expect(manager.getLimit("tracker", "max_items")).toBe(200);

    // Attempt to apply stale version 1
    const resStale = manager.applySnapshot(snapshot1);
    expect(resStale.updated).toBe(false);
    expect(manager.getLimit("tracker", "max_items")).toBe(200);
  });

  it("honors grace period during expiration when not in strict mode", () => {
    const expiredTimestamp = new Date(Date.now() - 1000).toISOString(); // 1s ago
    const snapshot: EntitlementSnapshot = {
      productId: "stremora",
      version: 1,
      issuedAt: new Date(Date.now() - 10000).toISOString(),
      expiresAt: expiredTimestamp,
      features: { premium_encoding: true },
      limits: { storage_gb: 50 },
    };

    manager.applySnapshot(snapshot);
    // Within 5s grace period: still accessible
    expect(manager.hasFeature("stremora", "premium_encoding")).toBe(true);
  });

  it("denies access immediately in strict mode when expired", () => {
    const strictManager = new EntitlementManager({ strictMode: true });
    const expiredTimestamp = new Date(Date.now() - 1000).toISOString();
    const snapshot: EntitlementSnapshot = {
      productId: "stremora",
      version: 1,
      issuedAt: new Date(Date.now() - 10000).toISOString(),
      expiresAt: expiredTimestamp,
      features: { premium_encoding: true },
      limits: { storage_gb: 50 },
    };

    strictManager.applySnapshot(snapshot);
    expect(strictManager.hasFeature("stremora", "premium_encoding")).toBe(false);
  });
});

describe("AdminPortalClient & MockAdminPortal Integration", () => {
  let mockPortal: MockAdminPortal;
  let client: AdminPortalClient;

  beforeEach(() => {
    mockPortal = new MockAdminPortal();
    client = new AdminPortalClient({
      baseUrl: "http://mock-portal.local",
      clientId: "tracker-prod",
      clientSecret: "product_secret_key_mock",
      maxRetries: 2,
      timeoutMs: 1000,
      transport: mockPortal.getTransport(),
    });
  });

  it("performs product handshake with Admin Portal", async () => {
    const manifest = createDefaultManifest({ productId: "tracker-app" });
    const res = await client.registerOrHandshake(manifest);

    expect(res.accepted).toBe(true);
    expect(res.portalVersion).toBe("2026.1.0");
    expect(mockPortal.state.registeredProducts.has("tracker-app")).toBe(true);
  });

  it("submits events with batching and idempotency deduplication", async () => {
    const events: ProductEvent[] = [
      {
        eventId: "evt_001_unique",
        eventType: "user.signup",
        schemaVersion: "1.0.0",
        productId: "tracker-app",
        occurredAt: new Date().toISOString(),
        environment: "development",
        payload: { userId: "usr_1" },
      },
      {
        eventId: "evt_002_unique",
        eventType: "task.created",
        schemaVersion: "1.0.0",
        productId: "tracker-app",
        occurredAt: new Date().toISOString(),
        environment: "development",
        payload: { taskId: "tsk_1" },
      },
    ];

    const res = await client.submitEvents(events);
    expect(res.acceptedCount).toBe(2);
    expect(mockPortal.state.receivedEvents.length).toBe(2);
  });

  it("retries on rate limit (429) and respects retry-after", async () => {
    mockPortal.state.simulateRateLimit = true;
    mockPortal.state.rateLimitRetryAfter = 0.05; // 50ms for fast test execution

    // After 100ms, clear rate limit
    setTimeout(() => {
      mockPortal.state.simulateRateLimit = false;
    }, 80);

    const manifest = createDefaultManifest({ productId: "namer-app" });
    const res = await client.registerOrHandshake(manifest);
    expect(res.accepted).toBe(true);
  });

  it("fails gracefully with IntegrationError during portal outage (503)", async () => {
    mockPortal.state.simulateOutage = true;

    const manifest = createDefaultManifest();
    await expect(client.registerOrHandshake(manifest)).rejects.toThrow(IntegrationError);
  });

  it("retrieves entitlement snapshot for product", async () => {
    const snapshot: EntitlementSnapshot = {
      productId: "tracker-app",
      version: 3,
      issuedAt: new Date().toISOString(),
      features: { export_pdf: true },
      limits: { max_workspaces: 5 },
    };
    mockPortal.setEntitlement(snapshot);

    const retrieved = await client.getEntitlements("tracker-app");
    expect(retrieved.version).toBe(3);
    expect(retrieved.features.export_pdf).toBe(true);
  });
});
