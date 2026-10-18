/*
 * page.tsx
 * Landing page component showcasing the initialized template foundation.
 * Demonstrates design tokens, typography, active capabilities, and SaaS integration status.
 */

export default function HomePage() {
  const capabilities = [
    {
      title: "Admin Portal Integration",
      tag: "v2026-10-01",
      description:
        "Cryptographic service handshake, monotonic entitlement sync, and inbound event verification.",
      endpoint: "/api/integration/v1/manifest",
    },
    {
      title: "Database & Prisma ORM",
      tag: "PostgreSQL",
      description:
        "Safeguarded connection pooling, relational user/session/subscription schema, and seed scripts.",
      endpoint: "/api/ready",
    },
    {
      title: "Authentication & RBAC",
      tag: "HMAC-SHA256",
      description:
        "Session tokens, granular permissions, role checks, resource ownership, and audit trail.",
      endpoint: "/api/health",
    },
    {
      title: "Billing & Entitlements",
      tag: "Razorpay Ready",
      description:
        "Tiered plan limits, feature evaluation, signature verification, and webhook deduplication.",
      endpoint: "/api/webhooks/billing",
    },
    {
      title: "Background Jobs",
      tag: "Durable Runner",
      description:
        "Exponential backoff with jitter, retryable vs permanent classification, and idempotency.",
      endpoint: null,
    },
    {
      title: "Observability & Probes",
      tag: "JSON Logger",
      description:
        "Credential-redacted structured logs, trace correlation IDs, liveness and readiness endpoints.",
      endpoint: "/api/health",
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-12">
        {/* Header Section */}
        <header className="space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1 text-xs font-medium text-[var(--muted-foreground)]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span>Workspace Online</span>
            <span className="text-[var(--border)]">|</span>
            <span>Template v2.0</span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
            Universal AI Engineering Workspace
          </h1>

          <p className="mx-auto max-w-2xl text-base text-[var(--muted-foreground)] sm:text-lg">
            Production-grade SaaS engineering foundation initialized. Core architecture, capability
            adapters, and central Admin Portal integration contracts are verified and ready.
          </p>
        </header>

        {/* Quick Diagnostics Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((cap) => (
            <div
              key={cap.title}
              className="flex flex-col justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--accent)]"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-[var(--foreground)]">{cap.title}</h2>
                  <span className="rounded bg-[var(--surface-muted)] px-2 py-0.5 text-[11px] font-mono text-[var(--muted-foreground)]">
                    {cap.tag}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
                  {cap.description}
                </p>
              </div>

              {cap.endpoint ? (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <a
                    href={cap.endpoint}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-mono text-[var(--accent)] hover:underline"
                  >
                    {cap.endpoint} &rarr;
                  </a>
                </div>
              ) : (
                <div className="mt-4 pt-3 border-t border-[var(--border)]">
                  <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                    Internal Module
                  </span>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* Quick Commands & Getting Started */}
        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
          <h2 className="text-sm font-semibold tracking-wide text-[var(--foreground)]">
            Next Steps & Prompt Protocol
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 text-xs text-[var(--muted-foreground)]">
            <div className="space-y-2">
              <p className="font-medium text-[var(--foreground)]">Bootstrap Product Logic</p>
              <p>
                Run{" "}
                <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[var(--foreground)]">
                  .agents/prompts/new-project.md
                </code>{" "}
                in your AI assistant to configure product scope, user stories, and custom
                invariants.
              </p>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-[var(--foreground)]">Integration Verification</p>
              <p>
                Run{" "}
                <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 font-mono text-[var(--foreground)]">
                  npm test
                </code>{" "}
                to run the 62+ unit and integration test suite across auth, database, billing, and
                portal contracts.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
