/*
 * portal-lifecycle.test.ts
 * Integration tests for the SaaS Admin Portal inbound event lifecycle and worker.
 * Asserts event acceptance, asynchronous worker dispatching, and entitlement sync.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  processInboundPortalEvent,
  processPendingPortalEvents,
  registerPortalEventHandler,
  clearPortalEventHandlers,
  defaultEntitlementManager,
} from "../lib/saas-integration";

describe("Admin Portal Inbound Event Worker", () => {
  beforeEach(() => {
    clearPortalEventHandlers();
  });

  it("processes entitlements.sync and updates local entitlement cache", async () => {
    // Re-register default handler
    registerPortalEventHandler("entitlements.sync", (payload) => {
      if (payload.snapshot) {
        defaultEntitlementManager.applySnapshot(payload.snapshot);
      }
    });

    const event = {
      eventId: "evt_sync_001",
      eventType: "entitlements.sync",
      payload: {
        snapshot: {
          productId: "starter-saas",
          tenantId: "cust_tenant_1",
          version: 1,
          issuedAt: new Date().toISOString(),
          features: { advanced_analytics: true, sso: true },
          limits: { seats: 10 },
        },
      },
    };

    const result = await processInboundPortalEvent(event);
    expect(result.success).toBe(true);
    expect(result.eventId).toBe("evt_sync_001");
    expect(result.eventType).toBe("entitlements.sync");

    expect(
      defaultEntitlementManager.hasFeature("starter-saas", "advanced_analytics", "cust_tenant_1"),
    ).toBe(true);
    expect(defaultEntitlementManager.hasFeature("starter-saas", "sso", "cust_tenant_1")).toBe(true);
  });

  it("dispatches custom registered event handlers", async () => {
    let customHandlerCalled = false;
    let receivedPayload: unknown = null;

    registerPortalEventHandler("organization.plan_upgraded", async (payload) => {
      customHandlerCalled = true;
      receivedPayload = payload;
    });

    const event = {
      eventId: "evt_custom_99",
      eventType: "organization.plan_upgraded",
      payload: { orgId: "org_123", newTier: "enterprise" },
    };

    const result = await processInboundPortalEvent(event);
    expect(result.success).toBe(true);
    expect(customHandlerCalled).toBe(true);
    expect(receivedPayload).toEqual({ orgId: "org_123", newTier: "enterprise" });
  });

  it("handles unregistered event types gracefully as accepted no-op", async () => {
    const event = {
      eventId: "evt_unknown_01",
      eventType: "system.maintenance.scheduled",
      payload: { durationMinutes: 30 },
    };

    const result = await processInboundPortalEvent(event);
    expect(result.success).toBe(true);
    expect(result.eventId).toBe("evt_unknown_01");
  });

  it("captures and returns handler execution errors", async () => {
    registerPortalEventHandler("failing.action", async () => {
      throw new Error("Simulated downstream processing failure");
    });

    const event = {
      eventId: "evt_err_01",
      eventType: "failing.action",
      payload: {},
    };

    const result = await processInboundPortalEvent(event);
    expect(result.success).toBe(false);
    expect(result.error).toContain("Simulated downstream processing failure");
  });

  it("drains pending portal events safely when database is empty or unconfigured", async () => {
    const summary = await processPendingPortalEvents(10);
    expect(summary).toBeDefined();
    expect(typeof summary.processedCount).toBe("number");
    expect(Array.isArray(summary.results)).toBe(true);
  });
});
