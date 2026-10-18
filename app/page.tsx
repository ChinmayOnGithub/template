/*
 * page.tsx
 * Developer setup verification view for the reusable SaaS starter kit.
 * Provides transparent diagnostic checks, remediation instructions, and route links.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import type { DiagnosticCheck, OverallStatus } from "@/app/api/setup-status/route";

interface SetupApiResponse {
  timestamp: string;
  overallStatus: OverallStatus;
  summary: {
    total: number;
    passed: number;
    failed: number;
    needsSetup: number;
    warnings: number;
    notChecked: number;
  };
  checks: DiagnosticCheck[];
}

export default function HomePage() {
  const [data, setData] = useState<SetupApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup-status");
      if (!res.ok) {
        throw new Error(`Diagnostics endpoint returned HTTP ${res.status}`);
      }
      const json = (await res.json()) as SetupApiResponse;
      setData(json);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const generateLocalEnvSnippet = () => {
    return `# Required: Local PostgreSQL connection string (adjust to your local database)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_dev"

# Required: High-entropy authentication secret (generate with: openssl rand -hex 32)
AUTH_SECRET="replace_with_a_random_32_character_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: Seed initial administrator email
INITIAL_ADMIN_EMAIL="admin@example.com"

# Optional: Admin Portal integration (leave unset for local mock mode)
# ADMIN_PORTAL_URL="http://localhost:4000"
# ADMIN_PORTAL_CLIENT_ID="dev_product_client_id"`;
  };

  const handleCopyEnv = () => {
    navigator.clipboard
      .writeText(generateLocalEnvSnippet())
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError("Failed to copy configuration to clipboard. Please copy manually.");
      });
  };

  const getStatusBadge = (status: DiagnosticCheck["status"]) => {
    switch (status) {
      case "passed":
        return (
          <Badge variant="success" size="sm">
            Passed
          </Badge>
        );
      case "needs_setup":
        return (
          <Badge variant="warning" size="sm">
            Needs setup
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" size="sm">
            Warning
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" size="sm">
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm">
            Not checked
          </Badge>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <header className="space-y-2 border-b border-[var(--border)] pb-5">
          <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
            Reusable SaaS starter kit — setup verification
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] sm:text-sm">
            Verify local environment configuration, PostgreSQL connectivity, and authentication
            setup before building.
          </p>
        </header>

        {/* Overall Status Banner */}
        <section aria-labelledby="status-summary-heading" className="space-y-4">
          <h2 id="status-summary-heading" className="sr-only">
            System Status Summary
          </h2>

          <div className="flex flex-col gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--muted-foreground)]">Overall Status:</span>
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {loading ? "Evaluating..." : data?.overallStatus || "Setup incomplete"}
                </span>
              </div>
              {data && (
                <p className="text-xs text-[var(--muted-foreground)]">
                  {data.summary.passed} passed, {data.summary.needsSetup} need setup,{" "}
                  {data.summary.warnings} warning(s), {data.summary.failed} failed.
                </p>
              )}
            </div>

            <Button variant="secondary" size="sm" onClick={fetchDiagnostics} disabled={loading}>
              {loading ? "Checking..." : "Run checks again"}
            </Button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              Error evaluating diagnostics: {error}
            </div>
          )}
        </section>

        {/* Diagnostic Checks List */}
        <section aria-labelledby="checks-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="checks-heading" className="text-sm font-semibold text-[var(--foreground)]">
              Diagnostic Checks
            </h2>
            <span className="text-xs text-[var(--muted-foreground)]">
              {data?.checks.length || 0} checks recorded
            </span>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--card)]">
            {loading && !data ? (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                Running subsystem checks...
              </div>
            ) : (
              data?.checks.map((check) => (
                <div key={check.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {check.name}
                        </span>
                        {check.configKey && (
                          <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.2 text-[10px] font-mono text-[var(--muted-foreground)]">
                            {check.configKey}
                          </code>
                        )}
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {check.message}
                      </p>
                    </div>

                    <div className="flex-shrink-0">{getStatusBadge(check.status)}</div>
                  </div>

                  {check.remediation && (
                    <div className="rounded border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
                      <span className="font-semibold">Remediation:</span> {check.remediation}
                    </div>
                  )}

                  {check.details && (
                    <details className="text-[11px] text-[var(--muted-foreground)] pt-1">
                      <summary className="cursor-pointer hover:underline text-[var(--accent)] font-medium">
                        Show details
                      </summary>
                      <pre className="mt-2 overflow-x-auto rounded bg-black/40 p-2 font-mono text-[10px]">
                        {JSON.stringify(check.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Local Development Configuration Helper */}
        <section aria-labelledby="config-helper-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2
                id="config-helper-heading"
                className="text-sm font-semibold text-[var(--foreground)]"
              >
                Local Environment Template (.env.local)
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Generate secrets using <code>openssl rand -hex 32</code>. Do not use development
                fallbacks in production.
              </p>
            </div>

            <Button variant="outline" size="sm" onClick={handleCopyEnv}>
              {copied ? "Copied" : "Copy template"}
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-black/40 p-3 font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            {generateLocalEnvSnippet()}
          </pre>
        </section>

        {/* Available Application Routes */}
        <section aria-labelledby="routes-heading" className="space-y-3">
          <h2 id="routes-heading" className="text-sm font-semibold text-[var(--foreground)]">
            Available Routes (Test manually)
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 text-xs">
            <Link
              href="/login"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/login</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Credentials sign-in
              </p>
            </Link>

            <Link
              href="/signup"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/signup</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">User registration</p>
            </Link>

            <Link
              href="/dashboard"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/dashboard</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                Protected workspace
              </p>
            </Link>

            <Link
              href="/settings/profile"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/settings/profile</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Profile settings</p>
            </Link>

            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/api/health</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Liveness probe</p>
            </a>

            <a
              href="/api/ready"
              target="_blank"
              rel="noreferrer"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/api/ready</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Readiness probe</p>
            </a>

            <Link
              href="/privacy"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/privacy</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Privacy policy</p>
            </Link>

            <Link
              href="/cookies"
              className="rounded border border-[var(--border)] p-2.5 hover:border-[var(--accent)] bg-[var(--card)] transition-colors"
            >
              <span className="font-medium text-[var(--foreground)]">/cookies</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Cookie policy</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
