/*
 * page.tsx
 * Cookie Policy legal and disclosure page template.
 * Enumerates cookies, local storage categories, and instructions for managing user consent.
 */

import Link from "next/link";
import { constructMetadata } from "@/lib/seo/config";

export const metadata = constructMetadata({
  title: "Cookie Policy",
  description:
    "Disclosures regarding the cookies and local storage mechanisms used by this application.",
  canonical: "/cookies",
});

export default function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <header className="border-b border-[var(--border)] pb-4">
          <div className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider mb-2">
            Legal Template
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Cookie Policy
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Last updated: [DATE_PLACEHOLDER]
          </p>
        </header>

        <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">
          <strong>Important Notice:</strong> Update this list whenever your application incorporates
          new analytics scripts, advertising providers, or persistent tracking cookies.
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            1. What Are Cookies and Local Storage
          </h2>
          <p>
            Cookies are small text files placed on your device to store data that can be recalled by
            a web server. Local storage is a browser-native database used to persist user
            preferences across browser sessions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            2. Categories of Storage We Use
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-semibold text-[var(--foreground)] text-xs">
                Strictly Necessary (Always Enabled)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Essential for core navigation, authentication tokens, CSRF protection, and session
                persistence.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-semibold text-[var(--foreground)] text-xs">
                Analytics & Performance (Optional)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Helps measure traffic and visitor engagement to improve system response times and
                features.
              </p>
            </div>

            <div className="rounded-lg border border-[var(--border)] p-4">
              <h3 className="font-semibold text-[var(--foreground)] text-xs">
                Marketing (Optional)
              </h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Facilitates relevant campaign attribution and product announcements across external
                platforms.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            3. Managing Your Preferences
          </h2>
          <p>
            You can modify your consent settings at any time using our on-page cookie preferences
            dialog or by clearing your browser storage cookies for this domain.
          </p>
        </section>

        <footer className="border-t border-[var(--border)] pt-4 text-xs">
          <Link href="/" className="text-[var(--accent)] hover:underline">
            Return to Homepage
          </Link>
        </footer>
      </article>
    </main>
  );
}
