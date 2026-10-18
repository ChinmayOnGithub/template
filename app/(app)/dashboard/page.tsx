/*
 * page.tsx
 * Authenticated user dashboard starter layout.
 * Shows active session profile, foundation shortcuts, and user settings navigation.
 */

"use client";

import { useSession, signOut } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/design-system/components/Button";
import { Card, CardHeader, CardBody } from "@/design-system/components/Card";
import { Badge } from "@/design-system/components/Badge";

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
        <div className="text-sm text-[var(--muted-foreground)]">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top Navbar */}
        <header className="flex items-center justify-between border-b border-[var(--border)] pb-5">
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <h1 className="text-lg font-semibold text-[var(--foreground)]">Workspace Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
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
          <Card className="md:col-span-1">
            <CardHeader>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">User Identity</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              <div>
                <span className="text-[11px] text-[var(--muted-foreground)]">Name</span>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.name || "Anonymous Member"}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[var(--muted-foreground)]">Email</span>
                <p className="text-sm font-medium text-[var(--foreground)]">
                  {session?.user?.email || "No email on record"}
                </p>
              </div>
              <div>
                <span className="text-[11px] text-[var(--muted-foreground)]">Role</span>
                <div className="mt-1">
                  <Badge variant="secondary">{session?.user ? "member" : "guest"}</Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions Card */}
          <Card className="md:col-span-2">
            <CardHeader>
              <h2 className="text-sm font-semibold text-[var(--foreground)]">
                Starter Kit Capabilities
              </h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Better Auth is mounted and managing sessions. Use the links below to test API
                endpoints, review database schemas, or inspect the integration manifest.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <a
                  href="/api/integration/v1/manifest"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors"
                >
                  <span className="font-semibold text-[var(--foreground)]">
                    Integration Manifest
                  </span>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                    Declared product capabilities & limits
                  </p>
                </a>

                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-[var(--border)] p-3 hover:border-[var(--accent)] transition-colors"
                >
                  <span className="font-semibold text-[var(--foreground)]">Health Diagnostics</span>
                  <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                    System liveness & readiness check
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
