/*
 * index.ts
 * Barrel export for the SaaS Admin Portal integration layer.
 * Provides public entry points for contract schemas, client, auth, and entitlement managers.
 */

export * from "./types";
export * from "./contract";
export * from "./auth";
export * from "./entitlements";
export * from "./client";
export * from "./mock-portal";
export * from "./worker";
