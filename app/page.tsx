/*
 * page.tsx
 * Template starter interface featuring Site Status diagnostics and Design.md showcase tabs.
 * Renders live subsystem health checks and the editorial component design system.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Download,
  Copy,
  Check,
  Heart,
  ExternalLink,
  RefreshCw,
  Terminal,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  CreditCard,
  Users,
  Percent,
  Sparkles,
  ArrowRight,
  Database,
  ShieldCheck,
  Mail,
  Layers,
  Server,
} from "lucide-react";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { Card } from "@/design-system/components/Card";
import { ThemeToggle } from "@/design-system/components/ThemeToggle";
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

export default function TemplateHomePage() {
  const [activeTab, setActiveTab] = useState<"status" | "design">("status");
  const [data, setData] = useState<SetupApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [likes, setLikes] = useState(37);
  const [hasLiked, setHasLiked] = useState(false);
  const [viewMode, setViewMode] = useState<"visual" | "raw">("visual");
  const [monthlyFilter, setMonthlyFilter] = useState("Monthly View");

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

  const handleCopyMcp = () => {
    const text =
      "Using designmd mcp, download the Template design system and implement it in my code";
    navigator.clipboard.writeText(text);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } else {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-body bg-dot-grid">
      {/* Top Sticky Navigation */}
      <nav className="sticky top-0 z-50 h-14 border-b border-[var(--border)] bg-[var(--surface)]/85 backdrop-blur-md">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                Template
              </span>
            </Link>
            <Badge
              variant="secondary"
              size="sm"
              className="font-mono text-[10px] uppercase tracking-wider"
            >
              AI STARTER KIT v1.0
            </Badge>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />

            <Link href="/dashboard" className="hidden sm:inline-flex">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Tab Navigation Sub-header */}
      <div className="border-b border-[var(--border)] bg-[var(--surface)]/50 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-1.5 py-2.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "status"}
              onClick={() => setActiveTab("status")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--button-radius)] text-xs font-medium transition-all ${
                activeTab === "status"
                  ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Site Status</span>
              {data && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    data.overallStatus === "Ready for local development" ||
                    data.overallStatus === "Production configuration verified"
                      ? "bg-emerald-400"
                      : "bg-amber-400 animate-pulse"
                  }`}
                />
              )}
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "design"}
              onClick={() => setActiveTab("design")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--button-radius)] text-xs font-medium transition-all ${
                activeTab === "design"
                  ? "bg-[var(--primary)] text-white shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Design.md</span>
            </button>
          </div>

          {activeTab === "status" ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] font-mono text-[var(--text-secondary)]">
                VIEW:
              </span>
              <div className="inline-flex items-center rounded-[var(--button-radius)] border border-[var(--border)] p-0.5 bg-[var(--surface)] text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setViewMode("visual")}
                  className={`px-2.5 py-1 rounded-[4px] transition-all ${
                    viewMode === "visual"
                      ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Visual
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("raw")}
                  className={`px-2.5 py-1 rounded-[4px] transition-all ${
                    viewMode === "raw"
                      ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold shadow-xs"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  Raw
                </button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="h-3 w-3" />}
              onClick={() => {
                const element = document.createElement("a");
                const file = new Blob(
                  [
                    "# Template Design System\n\nEditorial precision starter kit with modular monolith architecture.",
                  ],
                  { type: "text/markdown" },
                );
                element.href = URL.createObjectURL(file);
                element.download = "TEMPLATE_DESIGN_SYSTEM.md";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="text-xs h-7"
            >
              Download .md
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10">
        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 1: SITE STATUS (DB connectivity, setup, env, diagnostics)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "status" && (
          <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-[var(--primary)]" />
                  <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Site Status & System Verification
                  </h1>
                </div>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Real-time health verification of database connectivity, Better Auth, transactional
                  email, and integration contracts.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  isLoading={loading}
                  icon={<RefreshCw className="h-3.5 w-3.5" />}
                  onClick={fetchDiagnostics}
                >
                  Run checks again
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-[8px] border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-400 flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Diagnostics endpoint error: {error}</span>
              </div>
            )}

            {viewMode === "visual" ? (
              <>
                {/* Overall Status & Summary KPI Bar */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      Total Checks
                    </span>
                    <div className="mt-1.5 text-2xl font-bold font-display text-[var(--text-primary)]">
                      {data ? data.summary.total : "--"}
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      Passed
                    </span>
                    <div className="mt-1.5 text-2xl font-bold font-display text-emerald-500">
                      {data ? data.summary.passed : "--"}
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      Needs Setup
                    </span>
                    <div className="mt-1.5 text-2xl font-bold font-display text-sky-500">
                      {data ? data.summary.needsSetup : "--"}
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3.5">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      Warnings
                    </span>
                    <div className="mt-1.5 text-2xl font-bold font-display text-amber-500">
                      {data ? data.summary.warnings : "--"}
                    </div>
                  </div>

                  <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-3.5 col-span-2 sm:col-span-1">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                      Overall Status
                    </span>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          data?.overallStatus === "Ready for local development" ||
                          data?.overallStatus === "Production configuration verified"
                            ? "bg-emerald-500"
                            : "bg-amber-500 animate-pulse"
                        }`}
                      />
                      <span className="text-xs font-semibold font-display text-[var(--text-primary)] truncate">
                        {data?.overallStatus || "Checking..."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4 Core Pillars Overview Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Pillar 1: Database */}
                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-[var(--primary)]" />
                        <span className="font-display font-semibold text-xs text-[var(--text-primary)]">
                          Database
                        </span>
                      </div>
                      {data?.checks.find((c) => c.id === "db-connection")?.status === "passed" ? (
                        <Badge variant="success" size="sm">
                          Connected
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Local / Pending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Prisma ORM with pooling safeguards, migrations, and durable schema tables.
                    </p>
                  </div>

                  {/* Pillar 2: Auth */}
                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                        <span className="font-display font-semibold text-xs text-[var(--text-primary)]">
                          Better Auth
                        </span>
                      </div>
                      <Badge variant="success" size="sm">
                        Mounted
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Session management, RBAC enforcement, audit logging, and catch-all handler.
                    </p>
                  </div>

                  {/* Pillar 3: Email */}
                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[var(--primary)]" />
                        <span className="font-display font-semibold text-xs text-[var(--text-primary)]">
                          Email Sink
                        </span>
                      </div>
                      {data?.checks.find((c) => c.id === "email-delivery")?.status === "passed" ? (
                        <Badge variant="success" size="sm">
                          Configured
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          In-Memory Mock
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      Transactional email delivery with local test sink and queue replay.
                    </p>
                  </div>

                  {/* Pillar 4: Admin Portal */}
                  <div className="rounded-[10px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-[var(--primary)]" />
                        <span className="font-display font-semibold text-xs text-[var(--text-primary)]">
                          Admin Portal
                        </span>
                      </div>
                      {data?.checks.find((c) => c.id === "portal-connection")?.status ===
                      "passed" ? (
                        <Badge variant="success" size="sm">
                          Linked
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          Self-Contained
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      SaaS contract integration, HMAC signature verification, and worker.
                    </p>
                  </div>
                </div>

                {/* Detailed Diagnostics Checks Card */}
                <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div>
                      <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
                        System Diagnostics & Environment Inspection
                      </h2>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        Evaluation of runtime configurations, security secrets, and data
                        repositories.
                      </p>
                    </div>
                    <Badge variant="secondary" size="sm" className="font-mono text-[11px]">
                      {data?.checks.length || 0} checks inspected
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {data?.checks.map((check) => {
                      const isPass = check.status === "passed";
                      const isWarn = check.status === "warning";
                      const isNeeds = check.status === "needs_setup";
                      const isFail = check.status === "failed";

                      return (
                        <div
                          key={check.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/30 p-3.5 gap-3"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {isPass && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                              )}
                              {isWarn && (
                                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                              )}
                              {isNeeds && <AlertCircle className="h-4 w-4 text-sky-500 shrink-0" />}
                              {isFail && <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />}

                              <span className="text-sm font-semibold text-[var(--text-primary)] font-display">
                                {check.name}
                              </span>
                              {check.configKey && (
                                <span className="text-[11px] font-mono text-[var(--text-secondary)]">
                                  {check.configKey}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--text-secondary)] pl-6">
                              {check.message}
                            </p>
                            {check.remediation && (
                              <div className="pl-6 pt-1 text-[11px] font-mono text-[var(--primary)]">
                                → Remediation: {check.remediation}
                              </div>
                            )}
                          </div>

                          <div className="pl-6 sm:pl-0">
                            {isPass && (
                              <Badge variant="success" size="sm">
                                Passed
                              </Badge>
                            )}
                            {isWarn && (
                              <Badge variant="warning" size="sm">
                                Warning
                              </Badge>
                            )}
                            {isNeeds && (
                              <Badge variant="info" size="sm">
                                Needs setup
                              </Badge>
                            )}
                            {isFail && (
                              <Badge variant="destructive" size="sm">
                                Failed
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Live System Verification Routes Matrix */}
                <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-[var(--primary)]" />
                      <h2 className="font-display text-sm font-bold text-[var(--text-primary)]">
                        Live Verification & Diagnostic Endpoints
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-[var(--text-secondary)]">
                      Next.js 15 App Router
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                    <Link
                      href="/dashboard"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">/dashboard</span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Protected Member Area
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </Link>

                    <Link
                      href="/login"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">/login</span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Better Auth Authentication
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </Link>

                    <Link
                      href="/settings/profile"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          /settings/profile
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          User Profile Settings
                        </p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </Link>

                    <a
                      href="/api/health"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">
                          /api/health
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Liveness Probe (JSON)
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </a>

                    <a
                      href="/api/ready"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">
                          /api/ready
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          Readiness & DB Check
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </a>

                    <a
                      href="/api/integration/v1/manifest"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-3 rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/20 hover:border-[var(--primary)] transition-all hover:-translate-y-0.5"
                    >
                      <div>
                        <span className="font-mono font-semibold text-[var(--text-primary)]">
                          /api/integration/v1/manifest
                        </span>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                          SaaS Manifest Schema
                        </p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                    </a>
                  </div>
                </div>
              </>
            ) : (
              /* Raw JSON View */
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-[var(--primary)]" />
                    <span className="font-display font-semibold text-sm">
                      Raw Diagnostic API Output
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[var(--text-secondary)]">
                    GET /api/setup-status
                  </span>
                </div>
                <pre className="max-h-[600px] overflow-auto rounded-[6px] bg-[var(--surface-muted)] p-4 font-mono text-xs text-[var(--text-primary)] leading-relaxed">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════
            TAB 2: DESIGN.MD (UI showcase, design system tokens, specimens)
        ══════════════════════════════════════════════════════════════════════════ */}
        {activeTab === "design" && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* ── Left / Primary Column (8 Columns) ─────────────────────────────────── */}
            <div className="space-y-8 lg:col-span-8">
              {/* 1. Gallery Frame Card Surface: Curator Pro SaaS Analytics Showcase */}
              <div className="group relative overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--card-hover-shadow)]">
                {/* Embedded App Chrome Header */}
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 bg-[var(--surface-muted)]/50 sm:px-6">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-semibold tracking-tight text-[var(--text-primary)]">
                      Curator Pro
                    </span>
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                      EDITORIAL ANALYTICS
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                      Live Preview
                    </span>
                  </div>
                </div>

                {/* Dashboard Hero Inside Gallery Card */}
                <div className="p-5 sm:p-7 space-y-6">
                  {/* Executive Overview Banner */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-5">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--primary)] font-mono">
                        EXECUTIVE OVERVIEW
                      </span>
                      <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                        Welcome back, Chinmay.
                      </h2>
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        Your editorial SaaS ecosystem is thriving today with{" "}
                        <span className="font-semibold text-emerald-500 font-mono">+12.4%</span> MRR
                        momentum.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.4% this month
                      </Badge>
                    </div>
                  </div>

                  {/* KPI Metric Cards Grid (4 Columns) */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {/* KPI 1 */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3.5 transition-all hover:border-[var(--border-strong)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                          <CreditCard className="h-3.5 w-3.5 text-[var(--primary)]" />
                          <span>Total Revenue</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500 font-mono">
                          +8.2%
                        </span>
                      </div>
                      <div className="mt-2 text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
                        $482,900
                      </div>
                    </div>

                    {/* KPI 2 */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3.5 transition-all hover:border-[var(--border-strong)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                          <Users className="h-3.5 w-3.5 text-[var(--primary)]" />
                          <span>Active Subs</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500 font-mono">
                          +12%
                        </span>
                      </div>
                      <div className="mt-2 text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
                        12,402
                      </div>
                    </div>

                    {/* KPI 3 */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3.5 transition-all hover:border-[var(--border-strong)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                          <Percent className="h-3.5 w-3.5 text-amber-500" />
                          <span>Churn Rate</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500 font-mono">
                          -2.1%
                        </span>
                      </div>
                      <div className="mt-2 text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
                        1.42%
                      </div>
                    </div>

                    {/* KPI 4 */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/40 p-3.5 transition-all hover:border-[var(--border-strong)]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-medium">
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Average MRR</span>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-500 font-mono">
                          +4.5%
                        </span>
                      </div>
                      <div className="mt-2 text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
                        $38.50
                      </div>
                    </div>
                  </div>

                  {/* Chart & Smart Insights Split Row */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    {/* Bar Chart Visualization (7 Cols) */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--surface-muted)]/30 p-4 md:col-span-7 flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[var(--text-primary)] font-display">
                              MRR Trends
                            </h3>
                            <div className="inline-flex rounded-[4px] border border-[var(--border)] p-0.5 bg-[var(--surface)] text-[10px] font-medium">
                              <button
                                type="button"
                                onClick={() => setMonthlyFilter("Monthly View")}
                                className={`px-1.5 py-0.5 rounded-[2px] transition-all ${
                                  monthlyFilter === "Monthly View"
                                    ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold shadow-xs"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                }`}
                              >
                                Monthly
                              </button>
                              <button
                                type="button"
                                onClick={() => setMonthlyFilter("Quarterly View")}
                                className={`px-1.5 py-0.5 rounded-[2px] transition-all ${
                                  monthlyFilter === "Quarterly View"
                                    ? "bg-[var(--surface-muted)] text-[var(--text-primary)] font-semibold shadow-xs"
                                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                }`}
                              >
                                Quarterly
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                            Revenue growth across {monthlyFilter.toLowerCase()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                          <span>Growth Pace</span>
                        </div>
                      </div>

                      {/* Visual Bar Chart */}
                      <div className="flex h-36 items-end justify-between gap-1.5 pt-4">
                        {[35, 42, 50, 48, 62, 58, 70, 68, 78, 85, 92, 100].map((h, i) => {
                          const isPeak = i === 11;
                          return (
                            <div
                              key={i}
                              className="flex-1 flex flex-col items-center gap-1.5 group/bar"
                            >
                              <div
                                className={`w-full rounded-t-[3px] transition-all duration-300 ${
                                  isPeak
                                    ? "bg-[var(--primary)] shadow-[var(--button-glow)]"
                                    : "bg-[var(--border-strong)] group-hover/bar:bg-[var(--primary)]/60"
                                }`}
                                style={{ height: `${h}%` }}
                              />
                              <span className="text-[9px] font-mono text-[var(--neutral-muted)]">
                                {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Smart Insights & Action Card (5 Cols) */}
                    <div className="rounded-[8px] border border-[var(--border)] bg-[var(--primary)]/10 p-5 md:col-span-5 flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--primary)] font-mono uppercase tracking-wider">
                          <Sparkles className="h-3 w-3" />
                          NEW INSIGHTS
                        </span>
                        <h3 className="mt-2 text-base font-bold font-display text-[var(--text-primary)]">
                          Identify High-Churn Risk Segments
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-[var(--text-secondary)]">
                          AI analyzed customer retention patterns across your Starter plan tiers.
                          Addressing onboarding drop-off in week two saves an estimated $12k in MRR.
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                        <Link href="/dashboard">
                          <Button variant="primary" size="sm" className="w-full">
                            Explore Deep Analytics
                            <ArrowRight className="h-3 w-3 ml-1.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editorial Caption */}
              <p className="text-sm font-medium text-[var(--text-secondary)] leading-relaxed px-1">
                An editorial precision interface for a community platform where developers discover,
                share, and download design system files. The aesthetic is quietly confident — bold
                display typography, generous spacing, and gallery-frame card surfaces.
              </p>

              {/* 2. Design System Tokens Specimen Matrix */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Primary Color Swatch */}
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between h-40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Primary
                    </span>
                    <span className="font-mono text-xs text-[var(--primary)] font-semibold">
                      #6366F1
                    </span>
                  </div>
                  <div className="h-16 w-full rounded-[6px] bg-[var(--primary)] shadow-[var(--button-glow)] flex items-center justify-center text-white text-xs font-mono font-medium">
                    Indigo CTA
                  </div>
                  <div className="flex gap-1">
                    {["#312E81", "#4338CA", "#4F46E5", "#6366F1", "#818CF8", "#A5B4FC"].map(
                      (hex, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 rounded-[2px]"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Secondary Brand Color Swatch */}
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between h-40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--text-primary)]">
                      Secondary
                    </span>
                    <span className="font-mono text-xs text-[#20970B] font-semibold">#20970B</span>
                  </div>
                  <div className="h-16 w-full rounded-[6px] bg-[#20970B] flex items-center justify-center text-white text-xs font-mono font-medium">
                    Brand Accent
                  </div>
                  <div className="flex gap-1">
                    {["#14532D", "#166534", "#15803D", "#20970B", "#22C55E", "#86EFAC"].map(
                      (hex, i) => (
                        <div
                          key={i}
                          className="h-3 flex-1 rounded-[2px]"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Headline Typography Sample */}
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between h-40">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Headline</span>
                  <div className="font-display text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                    Aa
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    General Sans Bold (-0.035em)
                  </span>
                </div>

                {/* Button Styles Specimen */}
                <div className="overflow-hidden rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col justify-between h-40">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">Buttons</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Button variant="primary" size="sm" className="w-full text-[11px] h-7">
                      Primary
                    </Button>
                    <Button variant="secondary" size="sm" className="w-full text-[11px] h-7">
                      Secondary
                    </Button>
                    <button
                      type="button"
                      className="h-7 rounded-[var(--button-radius)] bg-amber-400 text-black text-[11px] font-semibold flex items-center justify-center hover:opacity-95"
                    >
                      Inverted
                    </button>
                    <Button variant="outline" size="sm" className="w-full text-[11px] h-7">
                      Outlined
                    </Button>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-secondary)]">
                    6px radius, hover lift
                  </span>
                </div>
              </div>
            </div>

            {/* ── Right / Sidebar Column (4 Columns) ────────────────────────────────── */}
            <div className="space-y-6 lg:col-span-4">
              {/* Action Bar (Top Right) */}
              <div className="flex flex-col gap-2.5">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Download className="h-4 w-4" />}
                  onClick={() => {
                    const element = document.createElement("a");
                    const file = new Blob(
                      [
                        "# Template Design System\n\nEditorial precision starter kit with modular monolith architecture.",
                      ],
                      { type: "text/markdown" },
                    );
                    element.href = URL.createObjectURL(file);
                    element.download = "TEMPLATE_DESIGN_SYSTEM.md";
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="w-full justify-center shadow-[var(--button-glow)]"
                >
                  Download .md
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={
                    copiedMcp ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )
                  }
                  onClick={handleCopyMcp}
                  className="w-full justify-center"
                >
                  {copiedMcp ? "Copied MCP prompt!" : "Copy to Clipboard"}
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  icon={
                    <Heart className={`h-4 w-4 ${hasLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                  }
                  onClick={handleLike}
                  className="w-full justify-center"
                >
                  Like ({likes})
                </Button>
              </div>

              {/* Author & Specs Card */}
              <Card className="space-y-4">
                <div className="flex items-center gap-3 border-b border-[var(--border)] pb-3.5">
                  <div className="h-10 w-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-display font-bold text-sm shadow-xs">
                    CP
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                      Chinmay
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] font-mono">@chinmay</p>
                  </div>
                </div>

                {/* Spec Table */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Project</span>
                    <span className="font-medium text-[var(--text-primary)] font-mono">
                      Template
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">License</span>
                    <span className="font-medium text-[var(--text-primary)] font-mono">MIT</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Architecture</span>
                    <span className="font-medium text-[var(--text-primary)] font-mono">
                      Modular Monolith
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Version</span>
                    <span className="font-medium text-[var(--text-primary)] font-mono">
                      v1.0 (Next.js 15)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">Verification</span>
                    <span className="font-medium text-emerald-500 font-mono">
                      111 Tests Passing
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--border-subtle)]">
                    <span className="text-[var(--text-secondary)]">E2E Smoke</span>
                    <span className="font-medium text-emerald-500 font-mono">Playwright Ready</span>
                  </div>
                </div>

                {/* Category Pill Tags */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["accessible", "indigo", "clean", "saas", "modular", "template"].map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="font-mono text-[10px]"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </Card>

              {/* Quick Route Navigation Matrix */}
              <div className="rounded-[12px] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2.5">
                <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                  Live Starter Routes
                </h3>
                <div className="grid grid-cols-1 gap-1.5 text-xs">
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors"
                  >
                    <span className="font-medium">/dashboard</span>
                    <span className="text-[var(--text-secondary)]">Protected Member Area</span>
                  </Link>
                  <Link
                    href="/login"
                    className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors"
                  >
                    <span className="font-medium">/login</span>
                    <span className="text-[var(--text-secondary)]">Better Auth Client</span>
                  </Link>
                  <Link
                    href="/settings/profile"
                    className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors"
                  >
                    <span className="font-medium">/settings/profile</span>
                    <span className="text-[var(--text-secondary)]">User Profile Settings</span>
                  </Link>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[var(--surface-muted)] text-[var(--text-primary)] transition-colors"
                  >
                    <span className="font-medium font-mono text-[11px]">/api/health</span>
                    <ExternalLink className="h-3 w-3 text-[var(--neutral-muted)]" />
                  </a>
                </div>
              </div>

              {/* Copy Link Action Button */}
              <Button
                variant="outline"
                size="md"
                icon={
                  copiedLink ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
                onClick={handleCopyLink}
                className="w-full justify-center"
              >
                {copiedLink ? "Link copied to clipboard!" : "Copy Link"}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
