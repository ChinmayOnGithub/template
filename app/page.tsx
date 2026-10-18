/*
 * page.tsx
 * Interactive developer setup dashboard and landing view for the starter kit.
 * Provides real-time subsystem diagnostics, environment verification, and quick navigation.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { Card, CardHeader, CardBody } from "@/design-system/components/Card";
import type { SubsystemStatus } from "@/app/api/setup-status/route";

interface DiagnosticsData {
  timestamp: string;
  summary: {
    total: number;
    ready: number;
    warnings: number;
    needsSetup: number;
    isFullyReady: boolean;
    completionPercentage: number;
  };
  subsystems: SubsystemStatus[];
}

export default function HomePage() {
  const [data, setData] = useState<DiagnosticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/setup-status");
      if (!res.ok) {
        throw new Error(`Diagnostics returned HTTP ${res.status}`);
      }
      const json = (await res.json()) as DiagnosticsData;
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const sampleEnv = `# Database Connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/saas_dev"

# Authentication Secret (32+ chars)
AUTH_SECRET="dev_fallback_secret_must_not_be_used_in_production_32b"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional Admin Portal Linkage
# ADMIN_PORTAL_URL="http://localhost:4000"
# ADMIN_PORTAL_CLIENT_ID="prod_sample_123"`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sampleEnv);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-10 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-10">
        {/* Top Header */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
            <span
              className={`h-2 w-2 rounded-full ${
                data?.summary.isFullyReady
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                  : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              }`}
            />
            <span>
              {loading
                ? "Checking Subsystems..."
                : data?.summary.isFullyReady
                  ? "All Subsystems Verified"
                  : `${data?.summary.needsSetup || 0} Item(s) Need Setup`}
            </span>
            <span className="text-[var(--border)]">|</span>
            <span>Framework Starter v2.0</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Universal AI SaaS Starter Kit
          </h1>

          <p className="mx-auto max-w-2xl text-sm text-[var(--muted-foreground)] sm:text-base leading-relaxed">
            A production-ready foundation with Better Auth, PostgreSQL Prisma schema, SEO
            infrastructure, and cookie consent. Review live subsystem diagnostics below to verify
            your local environment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/login">
              <Button variant="primary" size="sm">
                Test Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="sm">
                Create Account
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Workspace Dashboard
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={fetchDiagnostics} disabled={loading}>
              {loading ? "Probing..." : "Refresh Status"}
            </Button>
          </div>
        </header>

        {/* Live Setup & Diagnostic Score */}
        <section aria-labelledby="status-heading" className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h2 id="status-heading" className="text-base font-semibold text-[var(--foreground)]">
                Subsystem Diagnostics & Setup Health
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Real-time connection verification for authentication, database, email, and runtime
                environments
              </p>
            </div>
            {data && (
              <div className="text-right">
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  {data.summary.completionPercentage}% Ready
                </span>
                <div className="w-24 h-1.5 bg-[var(--surface-muted)] rounded-full mt-1 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      data.summary.completionPercentage === 100 ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${data.summary.completionPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-400">
              Diagnostic probe failed: {error}
            </div>
          )}

          {/* Subsystems Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {loading && !data ? (
              <div className="col-span-2 py-12 text-center text-xs text-[var(--muted-foreground)]">
                Querying runtime probes and database connections...
              </div>
            ) : (
              data?.subsystems.map((sub) => {
                const isReady = sub.status === "ready";
                const isWarning = sub.status === "warning";

                return (
                  <Card key={sub.name} className="flex flex-col justify-between">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-[var(--foreground)]">
                          {sub.name}
                        </span>
                      </div>
                      <Badge
                        variant={isReady ? "success" : isWarning ? "warning" : "destructive"}
                        size="sm"
                      >
                        {isReady ? "Ready" : isWarning ? "Attention" : "Needs Setup"}
                      </Badge>
                    </CardHeader>

                    <CardBody className="space-y-3 pt-2">
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                        {sub.message}
                      </p>

                      {sub.hint && (
                        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-2.5 text-[11px] text-amber-300">
                          <strong>Fix:</strong> {sub.hint}
                        </div>
                      )}

                      {sub.details && (
                        <div className="rounded bg-[var(--surface-muted)] p-2 text-[11px] font-mono text-[var(--muted-foreground)] space-y-1">
                          {Object.entries(sub.details).map(([key, val]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-[var(--foreground)]">{key}:</span>
                              <span>{String(val)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Developer Quick-Start Environment Helper */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Local Environment Quick-Setup (.env.local)
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Copy this starter configuration into your local <code>.env.local</code> file to
                resolve missing variables
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={copyToClipboard}>
              {copiedEnv ? "Copied" : "Copy Configuration"}
            </Button>
          </div>

          <pre className="overflow-x-auto rounded-lg border border-[var(--border)] bg-black/40 p-4 font-mono text-xs text-[var(--muted-foreground)] leading-relaxed">
            {sampleEnv}
          </pre>
        </section>

        {/* Available Application Endpoints */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Verified Starter Routes & Endpoints
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <Link
              href="/login"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/login</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Credentials sign-in</p>
            </Link>

            <Link
              href="/signup"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/signup</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">New user sign-up</p>
            </Link>

            <Link
              href="/dashboard"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/dashboard</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">Protected workspace</p>
            </Link>

            <Link
              href="/settings/profile"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/settings/profile</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                User profile & security
              </p>
            </Link>

            <a
              href="/api/health"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/api/health</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                Process liveness probe
              </p>
            </a>

            <a
              href="/api/ready"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/api/ready</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                Database readiness probe
              </p>
            </a>

            <Link
              href="/privacy"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/privacy</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                Privacy policy scaffold
              </p>
            </Link>

            <Link
              href="/cookies"
              className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors bg-[var(--surface)]"
            >
              <span className="font-semibold text-[var(--foreground)]">/cookies</span>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                Cookie policy scaffold
              </p>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
