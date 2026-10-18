/*
 * page.tsx
 * Terms of Service legal page template.
 * Sets forth boilerplate user agreements, service boundaries, and dispute guidelines.
 */

import Link from "next/link";
import { constructMetadata } from "@/lib/seo/config";

export const metadata = constructMetadata({
  title: "Terms of Service",
  description: "Terms and conditions governing access to this application.",
  canonical: "/terms",
});

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <header className="border-b border-[var(--border)] pb-4">
          <div className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider mb-2">
            Legal Template
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Terms of Service
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Last updated: [DATE_PLACEHOLDER]
          </p>
        </header>

        <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">
          <strong>Important Notice:</strong> This boilerplate document outlines generic SaaS terms.
          Before commercial launch, review and customize these terms with legal counsel licensed in
          your jurisdiction.
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the services provided by{" "}
            <strong>[COMPANY_OR_INDIVIDUAL_LEGAL_NAME]</strong>, you agree to be bound by these
            Terms of Service. If you do not agree to all terms, do not access the services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            2. User Accounts and Credentials
          </h2>
          <p>
            You are responsible for safeguarding your account login credentials and for any
            activities or actions under your account. Notify us immediately upon becoming aware of
            any breach of security or unauthorized use.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            3. Acceptable Use Policy
          </h2>
          <p>You agree not to misuse the services, including without limitation:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Interfering with or disrupting the integrity of server infrastructure.</li>
            <li>Attempting unauthorized access to accounts, computer systems, or networks.</li>
            <li>Uploading malicious code, trojans, viruses, or unlawful content.</li>
          </ul>
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
