/*
 * page.tsx
 * Landing page component showcasing the initialized template foundation.
 * Demonstrates design tokens, typography, and bootstrap readiness.
 */

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl space-y-6">
        <div className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1 text-xs text-[var(--muted-foreground)]">
          Universal AI Project Template v2.0
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          Universal AI Engineering Workspace
        </h1>
        <p className="text-base text-[var(--muted-foreground)] sm:text-lg">
          Bootstrap complete. Execute <code className="rounded bg-[var(--surface-muted)] px-1.5 py-0.5 text-sm font-mono text-[var(--foreground)]">.agents/prompts/new-project.md</code> or use the on-demand skill suite to begin implementation.
        </p>
      </div>
    </main>
  );
}
