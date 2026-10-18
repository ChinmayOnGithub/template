/*
 * page.tsx
 * Developer setup verification dashboard for the reusable SaaS starter kit.
 * Renders diagnostic checks, subsystem readiness, remediation guidance, and route links.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Database,
  Mail,
  KeyRound,
  Globe,
  Radio,
  FileCode2,
  Server,
  Layers,
} from "lucide-react";
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
          <Badge variant="success" size="sm" dot>
            Passed
          </Badge>
        );
      case "needs_setup":
        return (
          <Badge variant="warning" size="sm" dot>
            Needs setup
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="secondary" size="sm" dot>
            Warning
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive" size="sm" dot>
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" size="sm" dot>
            Not checked
          </Badge>
        );
    }
  };

  const getCheckIcon = (checkId: string) => {
    switch (checkId) {
      case "base_url":
        return <Globe className="h-4 w-4 text-[var(--muted-foreground)]" />;
      case "auth_secret":
        return <KeyRound className="h-4 w-4 text-[var(--muted-foreground)]" />;
      case "database":
        return <Database className="h-4 w-4 text-[var(--muted-foreground)]" />;
      case "email":
        return <Mail className="h-4 w-4 text-[var(--muted-foreground)]" />;
      case "portal":
        return <Radio className="h-4 w-4 text-[var(--muted-foreground)]" />;
      default:
        return <Server className="h-4 w-4 text-[var(--muted-foreground)]" />;
    }
  };

  const getOverallStatusDisplay = (status?: OverallStatus) => {
    switch (status) {
      case "Production configuration verified":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
          title: "Production configuration verified",
          colorClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        };
      case "Ready for local development":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-blue-400" />,
          title: "Ready for local development",
          colorClass: "border-blue-500/30 bg-blue-500/10 text-blue-300",
        };
      case "Setup incomplete":
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
          title: status || "Setup incomplete",
          colorClass: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        };
    }
  };

  const overall = getOverallStatusDisplay(data?.overallStatus);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Header */}
        <header className="space-y-2 border-b border-[var(--border)] pb-6">
          <div className="flex items-center gap-2.5">
            <Layers className="h-6 w-6 text-[var(--primary)]" />
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)] sm:text-2xl">
              Reusable SaaS Starter Kit — Setup Verification
            </h1>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] sm:text-sm">
            Verify local environment configuration, PostgreSQL connectivity, and authentication
            setup before developing features.
          </p>
        </header>

        {/* Overall Status Banner */}
        <section aria-labelledby="status-summary-heading">
          <h2 id="status-summary-heading" className="sr-only">
            System Status Summary
          </h2>

          <div className="flex flex-col gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <div className="mt-0.5">{overall.icon}</div>
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Overall Status:
                  </span>
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${overall.colorClass}`}
                  >
                    {loading ? "Evaluating..." : overall.title}
                  </span>
                </div>
                {data && (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {data.summary.passed} passed, {data.summary.needsSetup} need setup,{" "}
                    {data.summary.warnings} warning(s), {data.summary.failed} failed.
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={fetchDiagnostics}
              disabled={loading}
              icon={
                <RefreshCw
                  className={`h-3.5 w-3.5 text-current ${loading ? "animate-spin" : ""}`}
                />
              }
            >
              {loading ? "Checking..." : "Run checks again"}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Error evaluating diagnostics: {error}</span>
            </div>
          )}
        </section>

        {/* Diagnostic Checks List */}
        <section aria-labelledby="checks-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[var(--muted-foreground)]" />
              <h2 id="checks-heading" className="text-sm font-semibold text-[var(--foreground)]">
                Diagnostic Checks
              </h2>
            </div>
            <span className="text-xs font-mono text-[var(--muted-foreground)]">
              {data?.checks.length || 0} checks recorded
            </span>
          </div>

          <div className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-xs">
            {loading && !data ? (
              <div className="p-8 text-center text-xs text-[var(--muted-foreground)]">
                <RefreshCw className="mx-auto mb-2 h-4 w-4 animate-spin text-[var(--muted-foreground)]" />
                Running subsystem checks...
              </div>
            ) : (
              data?.checks.map((check) => (
                <div key={check.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-1.5">
                        {getCheckIcon(check.id)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-[var(--foreground)]">
                            {check.name}
                          </span>
                          {check.configKey && (
                            <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--muted-foreground)]">
                              {check.configKey}
                            </code>
                          )}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                          {check.message}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">{getStatusBadge(check.status)}</div>
                  </div>

                  {check.remediation && (
                    <div className="ml-9 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <span className="font-semibold">Remediation: </span>
                          <span>{check.remediation}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {check.details && (
                    <div className="ml-9 pt-1">
                      <details className="text-[11px] text-[var(--muted-foreground)]">
                        <summary className="cursor-pointer font-medium hover:underline text-[var(--primary)]">
                          Show technical details
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded-lg border border-[var(--border)] bg-black/40 p-3 font-mono text-[10px] text-[var(--muted-foreground)]">
                          {JSON.stringify(check.details, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Local Development Configuration Helper */}
        <section aria-labelledby="config-helper-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                <h2
                  id="config-helper-heading"
                  className="text-sm font-semibold text-[var(--foreground)]"
                >
                  Local Environment Template (.env.local)
                </h2>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">
                Generate secrets using <code>openssl rand -hex 32</code>. Do not use development
                fallbacks in production.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyEnv}
              icon={
                copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-current" />
                )
              }
            >
              {copied ? "Copied" : "Copy template"}
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-black/50 p-4 font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            {generateLocalEnvSnippet()}
          </pre>
        </section>

        {/* Available Application Routes */}
        <section aria-labelledby="routes-heading" className="space-y-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-[var(--muted-foreground)]" />
            <h2 id="routes-heading" className="text-sm font-semibold text-[var(--foreground)]">
              Available Routes (Test manually)
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <Link
              href="/login"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /login
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Credentials sign-in</p>
            </Link>

            <Link
              href="/signup"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /signup
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">User registration</p>
            </Link>

            <Link
              href="/dashboard"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /dashboard
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Protected workspace</p>
            </Link>

            <Link
              href="/settings/profile"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /settings/profile
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Profile settings</p>
            </Link>

            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /api/health
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Liveness probe</p>
            </a>

            <a
              href="/api/ready"
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /api/ready
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Readiness probe</p>
            </a>

            <Link
              href="/privacy"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /privacy
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Privacy policy</p>
            </Link>

            <Link
              href="/cookies"
              className="group rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 transition-all hover:border-[var(--primary)] hover:shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                  /cookies
                </span>
                <ExternalLink className="h-3 w-3 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Cookie policy</p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
