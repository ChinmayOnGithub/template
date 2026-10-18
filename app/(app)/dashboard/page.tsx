/*
 * page.tsx
 * Authenticated user dashboard starter layout compliant with the Genesis design system.
 * Shows active session profile, foundation shortcuts, and user settings navigation.
 */

"use client";

import { useSession, signOut } from "@/features/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/design-system/components/Button";
import { Card, CardHeader, CardBody } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";
import { ThemeToggle } from "@/design-system/components/ThemeToggle";
import { User, Shield, Terminal, ArrowUpRight, Activity } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--text-secondary)] font-mono animate-pulse">
          Loading session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-body bg-dot-grid px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Navbar */}
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-display text-xl font-bold tracking-tight text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors"
            >
              Genesis
            </Link>
            <span className="text-[var(--neutral-muted)]">/</span>
            <span className="font-display text-base font-semibold text-[var(--text-secondary)]">
              Workspace Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/settings/profile">
              <Button variant="ghost" size="sm">
                Settings
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </header>

        {/* User Profile Card */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="md:col-span-1 space-y-4">
            <CardHeader className="border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                  User Identity
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Name
                </span>
                <p className="font-display text-base font-semibold text-[var(--text-primary)] mt-0.5">
                  {session?.user?.name || "Anonymous Member"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Email
                </span>
                <p className="font-mono text-xs text-[var(--text-primary)] mt-0.5">
                  {session?.user?.email || "No email on record"}
                </p>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--text-secondary)]">
                  Role & Status
                </span>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="brand" size="sm">
                    {session?.user ? "member" : "guest"}
                  </Badge>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    active
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          <Card className="md:col-span-2 space-y-4">
            <CardHeader className="border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[var(--primary)]" />
                <h2 className="font-display text-sm font-semibold text-[var(--text-primary)]">
                  Starter Kit Capabilities
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Better Auth is mounted with role-based access control and persistent Prisma adapter.
                Use the developer endpoints below to inspect the integration contract, test
                background workers, or monitor system vitals.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <a
                  href="/api/integration/v1/manifest"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[8px] border border-[var(--border)] p-3.5 hover:border-[var(--primary)] bg-[var(--surface-muted)]/30 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-[var(--primary)]" />
                      <span className="font-display font-semibold text-[var(--text-primary)]">
                        Integration Manifest
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--neutral-muted)]" />
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 pl-6">
                    Declared product capabilities & limits schema
                  </p>
                </a>

                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[8px] border border-[var(--border)] p-3.5 hover:border-[var(--primary)] bg-[var(--surface-muted)]/30 transition-all hover:-translate-y-0.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[var(--primary)]" />
                      <span className="font-display font-semibold text-[var(--text-primary)]">
                        Health Diagnostics
                      </span>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-[var(--neutral-muted)]" />
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-1 pl-6">
                    Liveness and readiness verification endpoints
                  </p>
                </a>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
