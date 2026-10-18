/*
 * api.test.ts
 * Unit tests for API envelopes, error hierarchy, rate limiting, and idempotency.
 * Asserts error status mappings, header propagation, and mutation deduplication.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  apiSuccess,
  apiError,
  checkRateLimit,
  enforceRateLimit,
  clearRateLimitStore,
  withIdempotency,
  clearIdempotencyStore,
} from "../lib/api";

describe("API Error Hierarchy", () => {
  it("assigns appropriate status and codes to error subclasses", () => {
    const badReq = new BadRequestError("Missing field", { field: "email" });
    expect(badReq.statusCode).toBe(400);
    expect(badReq.code).toBe("BAD_REQUEST");
    expect(badReq.details).toEqual({ field: "email" });

    const unauth = new UnauthorizedError();
    expect(unauth.statusCode).toBe(401);
    expect(unauth.code).toBe("UNAUTHORIZED");

    const forbidden = new ForbiddenError();
    expect(forbidden.statusCode).toBe(403);
    expect(forbidden.code).toBe("FORBIDDEN");

    const notFound = new NotFoundError();
    expect(notFound.statusCode).toBe(404);
    expect(notFound.code).toBe("NOT_FOUND");
  });
});

describe("API Response Envelopes", () => {
  it("creates structured success envelope with meta", async () => {
    const response = apiSuccess({ id: 1, name: "Admin" }, { total: 1 });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");

    const json = await response.json();
    expect(json).toEqual({
      success: true,
      data: { id: 1, name: "Admin" },
      meta: { total: 1 },
    });
  });

  it("creates structured error envelope with request ID", async () => {
    const err = new NotFoundError("Project not found");
    const response = apiError(err, undefined, "req_abc123");
    expect(response.status).toBe(404);
    expect(response.headers.get("x-request-id")).toBe("req_abc123");

    const json = await response.json();
    expect(json).toEqual({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Project not found",
        requestId: "req_abc123",
      },
    });
  });
});

describe("Rate Limiting", () => {
  beforeEach(() => {
    clearRateLimitStore();
  });

  it("permits requests within quota and restricts when quota exceeded", () => {
    const ip = "127.0.0.1";
    const opts = { maxRequests: 2, windowMs: 10000 };

    const first = checkRateLimit(ip, opts);
    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);

    const second = checkRateLimit(ip, opts);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);

    const third = checkRateLimit(ip, opts);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);

    expect(() => enforceRateLimit(ip, opts)).toThrow(RateLimitError);
  });
});

describe("Idempotency", () => {
  beforeEach(() => {
    clearIdempotencyStore();
  });

  it("caches and returns previous mutation result on duplicate key", async () => {
    let callCount = 0;
    const action = async () => {
      callCount += 1;
      return { chargeId: "ch_123", amount: 4900 };
    };

    const first = await withIdempotency("idem_key_1", 10000, action);
    expect(first).toEqual({ chargeId: "ch_123", amount: 4900 });
    expect(callCount).toBe(1);

    // Repeated call with same key returns cached result without running action again
    const second = await withIdempotency("idem_key_1", 10000, action);
    expect(second).toEqual({ chargeId: "ch_123", amount: 4900 });
    expect(callCount).toBe(1);
  });

  it("executes action every time when no idempotency key is provided", async () => {
    let callCount = 0;
    const action = async () => {
      callCount += 1;
      return { count: callCount };
    };

    await withIdempotency(null, 10000, action);
    await withIdempotency(null, 10000, action);
    expect(callCount).toBe(2);
  });
});
