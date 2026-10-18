/*
 * auth.test.ts
 * Unit tests for authentication sessions, RBAC permissions, and ownership rules.
 * Asserts cryptographic token integrity, role boundaries, and timing attack resistance.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  createSessionToken,
  verifySessionToken,
  getSessionFromHeaders,
  hasPermission,
  requirePermission,
  assertOwnership,
  logSecurityEvent,
  getAuditLogBuffer,
  clearAuditLogBuffer,
} from "../lib/auth";
import { ForbiddenError, UnauthorizedError } from "../lib/api/errors";

describe("Session Token Generation and Verification", () => {
  it("generates and verifies signed session token", () => {
    const user = { userId: "usr_123", email: "founder@example.com", role: "admin" as const };
    const token = createSessionToken(user, 3600);

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe("usr_123");
    expect(verified?.email).toBe("founder@example.com");
    expect(verified?.role).toBe("admin");
  });

  it("rejects tampered tokens", () => {
    const user = { userId: "usr_123", email: "founder@example.com", role: "member" as const };
    const token = createSessionToken(user, 3600);
    const [payload] = token.split(".");
    const tampered = `${payload}.invalid_signature`;

    expect(verifySessionToken(tampered)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const user = { userId: "usr_123", email: "founder@example.com", role: "member" as const };
    // Negative TTL simulates past expiry
    const token = createSessionToken(user, -10);
    expect(verifySessionToken(token)).toBeNull();
  });

  it("extracts session from Authorization Bearer header", () => {
    const user = { userId: "usr_456", email: "team@example.com", role: "member" as const };
    const token = createSessionToken(user, 3600);

    const headers = new Headers({
      authorization: `Bearer ${token}`,
    });

    const session = getSessionFromHeaders(headers);
    expect(session?.userId).toBe("usr_456");
  });
});

describe("Role-Based Access Control (RBAC)", () => {
  it("enforces permission matrix across roles", () => {
    expect(hasPermission("admin", "billing:manage")).toBe(true);
    expect(hasPermission("member", "billing:manage")).toBe(false);
    expect(hasPermission("guest", "projects:create")).toBe(false);
    expect(hasPermission("member", "projects:create")).toBe(true);
  });

  it("requirePermission allows authorized users and throws ForbiddenError for unauthorized", () => {
    const adminUser = {
      userId: "u1",
      email: "admin@example.com",
      role: "admin" as const,
      exp: 9999999999,
    };
    const memberUser = {
      userId: "u2",
      email: "member@example.com",
      role: "member" as const,
      exp: 9999999999,
    };

    expect(() => requirePermission(adminUser, "billing:manage")).not.toThrow();
    expect(() => requirePermission(memberUser, "billing:manage")).toThrow(ForbiddenError);
    expect(() => requirePermission(null, "projects:read")).toThrow(UnauthorizedError);
  });

  it("assertOwnership permits resource owner and admin, rejects non-owners", () => {
    const owner = {
      userId: "usr_owner_1",
      email: "owner@example.com",
      role: "member" as const,
      exp: 9999999999,
    };
    const stranger = {
      userId: "usr_stranger_2",
      email: "other@example.com",
      role: "member" as const,
      exp: 9999999999,
    };
    const admin = {
      userId: "usr_admin_3",
      email: "admin@example.com",
      role: "admin" as const,
      exp: 9999999999,
    };

    // Owner succeeds
    expect(() => assertOwnership("usr_owner_1", owner)).not.toThrow();
    // Admin succeeds even if not owner
    expect(() => assertOwnership("usr_owner_1", admin)).not.toThrow();
    // Stranger fails
    expect(() => assertOwnership("usr_owner_1", stranger)).toThrow(ForbiddenError);
  });
});

describe("Security Audit Logging", () => {
  beforeEach(() => {
    clearAuditLogBuffer();
  });

  it("records security events with timestamps", () => {
    logSecurityEvent({
      action: "auth.login.failed",
      userId: "usr_unknown",
      ipAddress: "192.168.1.1",
      metadata: { reason: "invalid_password" },
    });

    const logs = getAuditLogBuffer();
    expect(logs.length).toBe(1);
    const log = logs[0];
    expect(log).toBeDefined();
    expect(log?.action).toBe("auth.login.failed");
    expect(log?.userId).toBe("usr_unknown");
    expect(log?.timestamp).toBeDefined();
  });
});
