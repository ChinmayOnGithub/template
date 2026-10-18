/*
 * route.ts
 * Real-time system diagnostics and setup verification API endpoint.
 * Probes authentication, database connectivity, email sinks, and environment integrity.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/better-auth";
import { db } from "@/lib/db";
import { getMockEmailProvider } from "@/lib/email";

export const dynamic = "force-dynamic";

export interface SubsystemStatus {
  name: string;
  category: "auth" | "database" | "email" | "portal" | "env";
  status: "ready" | "needs_setup" | "warning";
  message: string;
  details?: Record<string, unknown> | undefined;
  hint?: string | undefined;
}

export async function GET(): Promise<Response> {
  const subsystems: SubsystemStatus[] = [];

  // 1. Authentication Check (Better Auth)
  try {
    const isAuthAvailable = Boolean(auth && typeof auth.handler === "function");
    const authSecret = process.env.AUTH_SECRET;
    const isSecretConfigured = Boolean(
      authSecret && authSecret !== "dev_fallback_secret_must_not_be_used_in_production_32b",
    );
    const hasGithub = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);
    const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    subsystems.push({
      name: "Authentication (Better Auth)",
      category: "auth",
      status: isAuthAvailable ? (isSecretConfigured ? "ready" : "warning") : "needs_setup",
      message: isAuthAvailable
        ? isSecretConfigured
          ? "Better Auth is mounted with production secret"
          : "Better Auth is active using development fallback secret"
        : "Better Auth handler is not initialized",
      details: {
        mounted: isAuthAvailable,
        catchAllEndpoint: "/api/auth/[...all]",
        githubOAuth: hasGithub ? "enabled" : "not configured",
        googleOAuth: hasGoogle ? "enabled" : "not configured",
      },
      hint: !isSecretConfigured
        ? "Set a 32+ character AUTH_SECRET in .env.local for production"
        : undefined,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    subsystems.push({
      name: "Authentication (Better Auth)",
      category: "auth",
      status: "needs_setup",
      message: `Authentication error: ${msg}`,
      hint: "Check lib/auth/better-auth.ts configuration",
    });
  }

  // 2. Database Connectivity Check
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    subsystems.push({
      name: "Database (PostgreSQL / Prisma)",
      category: "database",
      status: "needs_setup",
      message: "DATABASE_URL environment variable is not defined",
      details: {
        provider: "PostgreSQL",
        orm: "Prisma",
        schema: "prisma/schema.prisma",
      },
      hint: "Add DATABASE_URL=postgresql://user:password@localhost:5432/dbname to .env.local",
    });
  } else {
    const start = performance.now();
    try {
      await db.$connect();
      const latencyMs = Math.round(performance.now() - start);

      subsystems.push({
        name: "Database (PostgreSQL / Prisma)",
        category: "database",
        status: "ready",
        message: `Database connection established (${latencyMs}ms)`,
        details: {
          connected: true,
          latencyMs,
          urlRedacted: databaseUrl.replace(/:[^:@]*@/, ":***@"),
        },
      });
    } catch (dbErr: unknown) {
      const msg = dbErr instanceof Error ? dbErr.message : String(dbErr);
      subsystems.push({
        name: "Database (PostgreSQL / Prisma)",
        category: "database",
        status: "needs_setup",
        message: `Failed to connect to database: ${msg}`,
        details: {
          connected: false,
          urlRedacted: databaseUrl.replace(/:[^:@]*@/, ":***@"),
        },
        hint: "Verify PostgreSQL server is running and credentials in DATABASE_URL are correct",
      });
    }
  }

  // 3. Email Delivery Check
  const mockEmail = getMockEmailProvider();
  const isMockEmail = Boolean(mockEmail);
  subsystems.push({
    name: "Email Delivery",
    category: "email",
    status: isMockEmail ? "warning" : "ready",
    message: isMockEmail
      ? "Using Development Test Sink (logs emails without external transmission)"
      : "Live email transport active",
    details: {
      provider: isMockEmail ? "MockEmailProvider (in-memory dev sink)" : "Production SMTP / API",
      sentCount: mockEmail ? mockEmail.sentEmails.length : 0,
      fromAddress: process.env.EMAIL_FROM || "noreply@example.com",
    },
    hint: isMockEmail ? "In production, configure live email credentials in lib/email" : undefined,
  });

  // 4. Admin Portal Integration Check
  const portalUrl = process.env.ADMIN_PORTAL_URL;
  const portalClientId = process.env.ADMIN_PORTAL_CLIENT_ID;
  const isPortalConfigured = Boolean(portalUrl && portalClientId);
  subsystems.push({
    name: "Admin Portal Integration",
    category: "portal",
    status: isPortalConfigured ? "ready" : "warning",
    message: isPortalConfigured
      ? `Configured for remote portal at ${portalUrl}`
      : "Running in local self-contained mock mode (portal disabled)",
    details: {
      configured: isPortalConfigured,
      manifestEndpoint: "/api/integration/v1/manifest",
      capabilitiesEndpoint: "/api/integration/v1/capabilities",
    },
    hint: !isPortalConfigured
      ? "Set ADMIN_PORTAL_URL and ADMIN_PORTAL_CLIENT_ID when connecting to central control plane"
      : undefined,
  });

  // 5. Environment Integrity Check
  const nodeEnv = process.env.NODE_ENV || "development";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  subsystems.push({
    name: "Environment Configuration",
    category: "env",
    status: "ready",
    message: `Running in ${nodeEnv} mode at ${appUrl}`,
    details: {
      nodeEnv,
      appUrl,
      nodeVersion: process.version,
    },
  });

  // Compute overall status summary
  const total = subsystems.length;
  const readyCount = subsystems.filter((s) => s.status === "ready").length;
  const warningCount = subsystems.filter((s) => s.status === "warning").length;
  const needsSetupCount = subsystems.filter((s) => s.status === "needs_setup").length;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      ready: readyCount,
      warnings: warningCount,
      needsSetup: needsSetupCount,
      isFullyReady: needsSetupCount === 0,
      completionPercentage: Math.round(((readyCount + warningCount * 0.5) / total) * 100),
    },
    subsystems,
  });
}
