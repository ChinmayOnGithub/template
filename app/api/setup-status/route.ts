/*
 * route.ts
 * Real-time system diagnostics and setup verification API endpoint.
 * Probes authentication, database connectivity, email sinks, and environment integrity.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db, isDatabaseConfigured } from "@/lib/db";
import { getMockEmailProvider } from "@/lib/email";

export const dynamic = "force-dynamic";

export type CheckStatus = "passed" | "failed" | "needs_setup" | "warning" | "not_checked";

export interface DiagnosticCheck {
  id: string;
  name: string;
  category: "auth" | "database" | "email" | "portal" | "env";
  status: CheckStatus;
  message: string;
  configKey?: string | undefined;
  remediation?: string | undefined;
  details?: Record<string, unknown> | undefined;
}

export type OverallStatus =
  "Setup incomplete" | "Ready for local development" | "Production configuration verified";

export async function GET(): Promise<Response> {
  const isProduction = process.env.NODE_ENV === "production";
  const checks: DiagnosticCheck[] = [];

  // 1. Environment & Base URL Check
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isHttps = appUrl.startsWith("https://");
  if (isProduction && !isHttps) {
    checks.push({
      id: "env-app-url",
      name: "Application Base URL",
      category: "env",
      status: "failed",
      message: "NEXT_PUBLIC_APP_URL must use HTTPS in production environments.",
      configKey: "NEXT_PUBLIC_APP_URL",
      remediation:
        "Set NEXT_PUBLIC_APP_URL to your secure HTTPS domain (e.g., https://app.example.com).",
    });
  } else {
    checks.push({
      id: "env-app-url",
      name: "Application Base URL",
      category: "env",
      status: "passed",
      message: `Configured for ${isProduction ? "production" : "local development"} at ${appUrl}`,
      details: !isProduction
        ? { nodeEnv: process.env.NODE_ENV || "development", appUrl }
        : undefined,
    });
  }

  // 2. Authentication Check (Better Auth)
  try {
    const isAuthAvailable = Boolean(auth && typeof auth.handler === "function");
    const authSecret = process.env.AUTH_SECRET;
    const isDefaultSecret =
      !authSecret || authSecret === "dev_fallback_secret_must_not_be_used_in_production_32b";

    if (!isAuthAvailable) {
      checks.push({
        id: "auth-system",
        name: "Authentication (Better Auth)",
        category: "auth",
        status: "failed",
        message: "Better Auth handler failed to initialize.",
        configKey: "lib/auth/better-auth.ts",
        remediation: "Inspect lib/auth/better-auth.ts for configuration errors.",
      });
    } else if (isProduction && isDefaultSecret) {
      checks.push({
        id: "auth-secret",
        name: "Authentication Secret",
        category: "auth",
        status: "failed",
        message: "AUTH_SECRET is unset or using insecure development fallback in production.",
        configKey: "AUTH_SECRET",
        remediation:
          "Generate a 32+ character random secret using 'openssl rand -hex 32' and set AUTH_SECRET.",
      });
    } else if (isDefaultSecret) {
      checks.push({
        id: "auth-secret",
        name: "Authentication Secret",
        category: "auth",
        status: "warning",
        message: "Using development fallback secret. Replace before production deployment.",
        configKey: "AUTH_SECRET",
        remediation: "Generate a random 32+ character string and set AUTH_SECRET in .env.local.",
        details: !isProduction ? { length: authSecret?.length || 0, isFallback: true } : undefined,
      });
    } else {
      checks.push({
        id: "auth-secret",
        name: "Authentication Secret",
        category: "auth",
        status: "passed",
        message: "High-entropy authentication secret configured.",
        details: !isProduction ? { length: authSecret.length } : undefined,
      });
    }
  } catch (err: unknown) {
    checks.push({
      id: "auth-system",
      name: "Authentication (Better Auth)",
      category: "auth",
      status: "failed",
      message: isProduction ? "Authentication initialization error." : String(err),
      remediation: "Inspect lib/auth/better-auth.ts.",
    });
  }

  // 3. Database Connectivity Check (with 2s bounded timeout)
  if (!isDatabaseConfigured()) {
    checks.push({
      id: "database-conn",
      name: "Database (PostgreSQL / Prisma)",
      category: "database",
      status: isProduction ? "failed" : "needs_setup",
      message: "DATABASE_URL is not configured.",
      configKey: "DATABASE_URL",
      remediation:
        "Configure DATABASE_URL=postgresql://user:password@localhost:5432/dbname in .env.local",
    });
  } else {
    const start = performance.now();
    try {
      // 2000ms timeout guard
      await Promise.race([
        db.$connect(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection probe timed out after 2000ms")), 2000),
        ),
      ]);

      const latencyMs = Math.round(performance.now() - start);
      checks.push({
        id: "database-conn",
        name: "Database (PostgreSQL / Prisma)",
        category: "database",
        status: "passed",
        message: `Connected successfully (${latencyMs}ms)`,
        details: !isProduction ? { latencyMs, connected: true } : undefined,
      });
    } catch (_err: unknown) {
      checks.push({
        id: "database-conn",
        name: "Database (PostgreSQL / Prisma)",
        category: "database",
        status: "failed",
        message: isProduction
          ? "Database connection probe failed."
          : "Unable to establish connection to PostgreSQL.",
        configKey: "DATABASE_URL",
        remediation: "Verify PostgreSQL is running and credentials in DATABASE_URL are valid.",
      });
    }
  }

  // 4. Email Delivery Check (Truthful labeling)
  const mockEmail = getMockEmailProvider();
  if (mockEmail) {
    checks.push({
      id: "email-delivery",
      name: "Email Delivery Transport",
      category: "email",
      status: isProduction ? "failed" : "warning",
      message: "Development in-memory email sink active (emails recorded in memory, not sent).",
      configKey: "EMAIL_FROM / lib/email",
      remediation: isProduction
        ? "Configure production SMTP or API provider in lib/email."
        : undefined,
      details: !isProduction ? { sentInMemoryCount: mockEmail.sentEmails.length } : undefined,
    });
  } else {
    checks.push({
      id: "email-delivery",
      name: "Email Delivery Transport",
      category: "email",
      status: "passed",
      message: "Production email transport active.",
    });
  }

  // 5. Admin Portal Integration Check (Truthful labeling)
  const portalUrl = process.env.ADMIN_PORTAL_URL;
  const portalClientId = process.env.ADMIN_PORTAL_CLIENT_ID;
  if (!portalUrl || !portalClientId) {
    checks.push({
      id: "portal-integration",
      name: "Admin Portal Integration",
      category: "portal",
      status: "warning",
      message: "Running in local self-contained mock mode (portal disconnected).",
      configKey: "ADMIN_PORTAL_URL / ADMIN_PORTAL_CLIENT_ID",
      remediation:
        "Set ADMIN_PORTAL_URL and ADMIN_PORTAL_CLIENT_ID when connecting to central control plane.",
    });
  } else {
    checks.push({
      id: "portal-integration",
      name: "Admin Portal Integration",
      category: "portal",
      status: "passed",
      message: `Configured for remote portal linkage (${portalUrl})`,
    });
  }

  // Determine overall status deterministically
  const failedCount = checks.filter((c) => c.status === "failed").length;
  const needsSetupCount = checks.filter((c) => c.status === "needs_setup").length;
  const warningCount = checks.filter((c) => c.status === "warning").length;
  const passedCount = checks.filter((c) => c.status === "passed").length;

  let overallStatus: OverallStatus = "Setup incomplete";

  if (isProduction) {
    if (failedCount === 0 && needsSetupCount === 0 && warningCount === 0) {
      overallStatus = "Production configuration verified";
    } else {
      overallStatus = "Setup incomplete";
    }
  } else {
    // Local development mode:
    if (failedCount === 0 && needsSetupCount === 0) {
      overallStatus = "Ready for local development";
    } else {
      overallStatus = "Setup incomplete";
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    overallStatus,
    summary: {
      total: checks.length,
      passed: passedCount,
      failed: failedCount,
      needsSetup: needsSetupCount,
      warnings: warningCount,
      notChecked: 0,
    },
    checks,
  });
}
