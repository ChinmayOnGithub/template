/*
 * contract.ts
 * Runtime Zod validation schemas for the SaaS integration contract.
 * Guarantees payload integrity and rejects malformed data across integration boundaries.
 */

import { z } from "zod";
import {
  INTEGRATION_API_VERSION,
  type ProductManifest,
  type ProductEvent,
  type EntitlementSnapshot,
} from "./types";

export const IntegrationCapabilitySchema = z.enum([
  "health.read",
  "events.write",
  "entitlements.read",
  "usage.write",
  "commands.receive",
]);

export const FeatureLimitDefinitionSchema = z
  .object({
    type: z.enum(["boolean", "number"]),
    defaultValue: z.union([z.boolean(), z.number()]),
    description: z.string().min(1),
  })
  .refine(
    (def) => {
      if (def.type === "boolean") return typeof def.defaultValue === "boolean";
      if (def.type === "number") return typeof def.defaultValue === "number";
      return false;
    },
    {
      message: "defaultValue must match the declared feature type",
      path: ["defaultValue"],
    },
  );

export const ProductManifestSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  productId: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-z0-9-]+$/, "productId must be lowercase alphanumeric with hyphens"),
  name: z.string().min(1).max(128),
  version: z.string().min(1).max(32),
  integrationApiVersion: z.string().min(1),
  environment: z.enum(["development", "staging", "production", "test"]),
  capabilities: z
    .array(IntegrationCapabilitySchema)
    .refine((caps) => new Set(caps).size === caps.length, {
      message: "Duplicate capabilities are not allowed",
    }),
  features: z.record(
    z
      .string()
      .min(1)
      .regex(/^[a-z0-9_]+$/, "Feature key must be snake_case"),
    FeatureLimitDefinitionSchema,
  ),
  healthEndpoint: z.string().url().optional(),
});

export const ProductEventSchema = z.object({
  eventId: z.string().min(8),
  eventType: z.string().min(1).max(128),
  schemaVersion: z.literal("1.0.0"),
  productId: z.string().min(2),
  occurredAt: z.string().datetime({ message: "occurredAt must be a valid ISO8601 timestamp" }),
  environment: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  correlationId: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const EntitlementSnapshotSchema = z.object({
  productId: z.string().min(2),
  tenantId: z.string().optional(),
  version: z.number().int().nonnegative(),
  issuedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  planId: z.string().optional(),
  features: z.record(z.string(), z.boolean()),
  limits: z.record(z.string(), z.number()),
});

export function validateProductManifest(data: unknown): ProductManifest {
  return ProductManifestSchema.parse(data) as ProductManifest;
}

export function validateProductEvent(data: unknown): ProductEvent {
  return ProductEventSchema.parse(data) as ProductEvent;
}

export function validateEntitlementSnapshot(data: unknown): EntitlementSnapshot {
  return EntitlementSnapshotSchema.parse(data) as EntitlementSnapshot;
}

export function createDefaultManifest(overrides: Partial<ProductManifest> = {}): ProductManifest {
  const base: ProductManifest = {
    schemaVersion: "1.0.0",
    productId: "universal-template-product",
    name: "Universal SaaS Product",
    version: "1.0.0",
    integrationApiVersion: INTEGRATION_API_VERSION,
    environment: (process.env.NODE_ENV as ProductManifest["environment"]) || "development",
    capabilities: ["health.read", "events.write", "entitlements.read"],
    features: {
      export_csv: {
        type: "boolean",
        defaultValue: false,
        description: "Enables raw data CSV export",
      },
      max_projects: {
        type: "number",
        defaultValue: 3,
        description: "Maximum active projects allowed",
      },
    },
  };

  return { ...base, ...overrides };
}
