/*
 * types.ts
 * Type definitions and interfaces for the SaaS Admin Portal integration layer.
 * Standardizes communication contracts between products and the central control plane.
 */

export const INTEGRATION_API_VERSION = "2026-10-01";

export type IntegrationCapability =
  "health.read" | "events.write" | "entitlements.read" | "usage.write" | "commands.receive";

export interface FeatureLimitDefinition {
  type: "boolean" | "number";
  defaultValue: boolean | number;
  description: string;
}

export interface ProductManifest {
  schemaVersion: "1.0.0";
  productId: string;
  name: string;
  version: string;
  integrationApiVersion: string;
  environment: "development" | "staging" | "production" | "test";
  capabilities: IntegrationCapability[];
  features: Record<string, FeatureLimitDefinition>;
  healthEndpoint?: string;
}

export interface ProductEvent {
  eventId: string;
  eventType: string;
  schemaVersion: "1.0.0";
  productId: string;
  occurredAt: string;
  environment: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  idempotencyKey?: string;
}

export interface EntitlementSnapshot {
  productId: string;
  tenantId?: string;
  version: number;
  issuedAt: string;
  expiresAt?: string;
  planId?: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
}

export interface HandshakeResponse {
  accepted: boolean;
  registeredAt: string;
  portalVersion: string;
  supportedCapabilities: IntegrationCapability[];
}

export interface InboundIntegrationEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  source: "admin-portal";
  payload: Record<string, unknown>;
}
