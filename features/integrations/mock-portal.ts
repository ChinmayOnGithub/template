/*
 * mock-portal.ts
 * In-memory mock server and test harness simulating the central Admin Portal.
 * Enables deterministic testing of handshakes, events, entitlements, rate limits, and outages.
 */

import { type ProductManifest, type ProductEvent, type EntitlementSnapshot } from "./types";
import { validateProductManifest, validateProductEvent } from "./contract";
import { generatePortalSignature } from "./auth";

export interface MockPortalState {
  registeredProducts: Map<string, ProductManifest>;
  receivedEvents: ProductEvent[];
  seenIdempotencyKeys: Set<string>;
  entitlements: Map<string, EntitlementSnapshot>;
  simulateOutage: boolean;
  simulateRateLimit: boolean;
  rateLimitRetryAfter: number;
  signingSecret: string;
}

export class MockAdminPortal {
  public state: MockPortalState = {
    registeredProducts: new Map(),
    receivedEvents: [],
    seenIdempotencyKeys: new Set(),
    entitlements: new Map(),
    simulateOutage: false,
    simulateRateLimit: false,
    rateLimitRetryAfter: 1,
    signingSecret: "mock_portal_signing_secret_for_tests_only",
  };

  public reset(): void {
    this.state.registeredProducts.clear();
    this.state.receivedEvents = [];
    this.state.seenIdempotencyKeys.clear();
    this.state.entitlements.clear();
    this.state.simulateOutage = false;
    this.state.simulateRateLimit = false;
  }

  public setEntitlement(snapshot: EntitlementSnapshot): void {
    const key = `${snapshot.productId}:${snapshot.tenantId || "global"}`;
    this.state.entitlements.set(key, snapshot);
  }

  public createSignedPortalPayload(payload: Record<string, unknown>): {
    body: string;
    signature: string;
  } {
    const body = JSON.stringify(payload);
    const signature = generatePortalSignature(body, this.state.signingSecret);
    return { body, signature };
  }

  /**
   * Fetch-compatible mock transport for AdminPortalClient
   */
  public getTransport(): (url: string, init: RequestInit) => Promise<Response> {
    return async (url: string, init: RequestInit): Promise<Response> => {
      const parsedUrl = new URL(url);
      const path = parsedUrl.pathname;
      const method = (init.method || "GET").toUpperCase();
      const headers = new Headers(init.headers as HeadersInit);

      if (this.state.simulateOutage) {
        return new Response("Service Unavailable: Mock Admin Portal Outage", { status: 503 });
      }

      if (this.state.simulateRateLimit) {
        return new Response("Too Many Requests", {
          status: 429,
          headers: { "retry-after": String(this.state.rateLimitRetryAfter) },
        });
      }

      // Check auth header
      const auth = headers.get("authorization");
      if (!auth || !auth.startsWith("Bearer ")) {
        return new Response("Unauthorized: Missing Bearer token", { status: 401 });
      }

      const idempotencyKey = headers.get("x-idempotency-key");
      if (idempotencyKey) {
        if (this.state.seenIdempotencyKeys.has(idempotencyKey) && method === "POST") {
          return new Response(JSON.stringify({ accepted: true, deduplicated: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
        this.state.seenIdempotencyKeys.add(idempotencyKey);
      }

      // 1. Handshake
      if (path === "/api/v1/products/handshake" && method === "POST") {
        try {
          const body = JSON.parse(init.body as string);
          const manifest = validateProductManifest(body);
          this.state.registeredProducts.set(manifest.productId, manifest);

          return new Response(
            JSON.stringify({
              accepted: true,
              registeredAt: new Date().toISOString(),
              portalVersion: "2026.1.0",
              supportedCapabilities: manifest.capabilities,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: unknown) {
          return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // 2. Event Ingestion
      if (path === "/api/v1/events/batch" && method === "POST") {
        try {
          const body = JSON.parse(init.body as string);
          const rawEvents = (body.events as unknown[]) || [];
          const validated = rawEvents.map(validateProductEvent);
          this.state.receivedEvents.push(...validated);

          return new Response(JSON.stringify({ acceptedCount: validated.length }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (err: unknown) {
          return new Response(JSON.stringify({ error: (err as Error).message }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
      }

      // 3. Entitlements
      if (path.startsWith("/api/v1/entitlements/") && method === "GET") {
        const parts = path.split("/");
        const productId = parts[4] || "";
        const tenantId = parsedUrl.searchParams.get("tenantId") || undefined;
        const key = `${productId}:${tenantId || "global"}`;
        const snapshot = this.state.entitlements.get(key);

        if (!snapshot) {
          return new Response(JSON.stringify({ error: "Entitlements not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(JSON.stringify(snapshot), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      // 4. Health
      if (path === "/api/v1/health/report" && method === "POST") {
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("Not Found", { status: 404 });
    };
  }
}
