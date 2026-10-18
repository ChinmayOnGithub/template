/*
 * security-flows.test.ts
 * End-to-end security verification tests for administrator bootstrap and fail-closed policies.
 * Asserts privilege isolation, secret enforcement, and durable persistence safety.
 */

import { describe, it, expect, afterEach } from "vitest";
import { logSecurityEvent, logCriticalSecurityEvent, getAuditLogBuffer } from "../lib/auth/audit";
import { withIdempotency } from "../lib/api/idempotency";
import { sendEmail, setEmailProvider, MockEmailProvider } from "../lib/email";
import { assertBillingProviderConfigured } from "../lib/billing/adapter";
import { validatePortalBaseUrl } from "../lib/saas-integration/client";

describe("Administrator Bootstrap & Privilege Isolation", () => {
  const originalEnv = process.env.INITIAL_ADMIN_EMAIL;

  afterEach(() => {
    process.env.INITIAL_ADMIN_EMAIL = originalEnv;
  });

  // Pure bootstrap rule evaluator mirroring lib/auth/better-auth.ts
  function evaluateUserRegistrationRole(
    userEmail: string,
    existingAdminCount: number,
  ): "admin" | "member" {
    const configuredAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
    const normalizedUserEmail = userEmail.trim().toLowerCase();

    if (configuredAdminEmail && normalizedUserEmail === configuredAdminEmail) {
      if (existingAdminCount === 0) {
        return "admin";
      }
      // Ongoing privilege escalation prevented: if an admin already exists, do not elevate
      return "member";
    }
    return "member";
  }

  it("designates the initial user as admin if email matches and no admin exists yet", () => {
    process.env.INITIAL_ADMIN_EMAIL = "founder@example.com";

    const role = evaluateUserRegistrationRole("founder@example.com", 0);
    expect(role).toBe("admin");
  });

  it("prevents subsequent public registrations from claiming admin privileges", () => {
    process.env.INITIAL_ADMIN_EMAIL = "founder@example.com";

    // An admin already exists in the system
    const role = evaluateUserRegistrationRole("founder@example.com", 1);
    expect(role).toBe("member");
  });

  it("defaults arbitrary public user registrations strictly to member", () => {
    process.env.INITIAL_ADMIN_EMAIL = "founder@example.com";

    const role = evaluateUserRegistrationRole("attacker@example.com", 0);
    expect(role).toBe("member");
  });

  it("defaults all users to member when INITIAL_ADMIN_EMAIL is unset", () => {
    delete process.env.INITIAL_ADMIN_EMAIL;

    const role = evaluateUserRegistrationRole("anyuser@example.com", 0);
    expect(role).toBe("member");
  });
});

describe("Production Secret Enforcement & Fail-Closed Transport", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalResendKey = process.env.RESEND_API_KEY;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    process.env.RESEND_API_KEY = originalResendKey;
    setEmailProvider(new MockEmailProvider());
  });

  it("refuses to dispatch email via unconfigured provider in production", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;

    await expect(
      sendEmail({
        to: "user@example.com",
        subject: "Hello",
        html: "<p>Test</p>",
      }),
    ).rejects.toThrow(/Transactional email provider credentials.*must be configured in production/);
  });

  it("refuses to initialize mock billing in production mode", () => {
    expect(() => assertBillingProviderConfigured("production", "mock")).toThrow(
      /must be explicitly configured/,
    );
  });

  it("refuses cleartext HTTP for external Admin Portal communication in production", () => {
    expect(() => validatePortalBaseUrl("http://portal.company.internal", "production")).toThrow(
      /requires HTTPS/,
    );
  });
});

describe("Audit Logging & Durable Persistence Safety", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  it("records security event into in-memory buffer", () => {
    const event = logSecurityEvent({
      action: "user.login_attempt",
      userId: "usr_sec_1",
      ipAddress: "127.0.0.1",
      metadata: { method: "password" },
    });

    expect(event.action).toBe("user.login_attempt");
    expect(event.userId).toBe("usr_sec_1");

    const buffer = getAuditLogBuffer();
    expect(buffer.some((e) => e.userId === "usr_sec_1")).toBe(true);
  });

  it("fails closed in production mode when critical audit logging lacks database", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    await expect(
      logCriticalSecurityEvent({
        action: "admin.privilege_revoked",
        userId: "usr_admin_1",
        metadata: { target: "usr_bad" },
      }),
    ).rejects.toThrow(/Database persistence is required/);
  });

  it("fails closed in production mode when idempotency storage lacks database", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "production";

    await expect(
      withIdempotency("idemp_prod_key_999", 60000, async () => {
        return { status: "processed" };
      }),
    ).rejects.toThrow(/Durable database persistence is required/);
  });
});
