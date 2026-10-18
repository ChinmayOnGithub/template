/*
 * index.ts
 * Central barrel export for API foundation utilities and error classes.
 * Provides unified access to handlers, response envelopes, rate limiting, and errors.
 */

export * from "./errors";
export * from "./response";
export * from "./handler";
export * from "./rate-limit";
export * from "./idempotency";
