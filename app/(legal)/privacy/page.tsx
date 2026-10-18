/*
 * page.tsx
 * Privacy Policy legal page template.
 * Contains honest business placeholders and explains user data practices for future products.
 */

import Link from "next/link";
import { constructMetadata } from "@/lib/seo/config";

export const metadata = constructMetadata({
  title: "Privacy Policy",
  description: "Starter template privacy policy and data protection disclosures.",
  canonical: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-12 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl space-y-6 text-sm text-[var(--muted-foreground)] leading-relaxed">
        <header className="border-b border-[var(--border)] pb-4">
          <div className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider mb-2">
            Legal Template
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            Last updated: [DATE_PLACEHOLDER]
          </p>
        </header>

        <section className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">
          <strong>Important Notice:</strong> This is a boilerplate privacy policy template for new
          applications. It must be thoroughly customized by legal counsel to reflect the actual data
          collection, retention, and third-party processors used by your deployed product before
          public launch.
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            1. Entity Identification
          </h2>
          <p>
            This website and related services are operated by{" "}
            <strong>[COMPANY_OR_INDIVIDUAL_LEGAL_NAME]</strong>, located in{" "}
            <strong>[JURISDICTION_CITY_COUNTRY]</strong> (&quot;we&quot;, &quot;our&quot;, or
            &quot;us&quot;). Contact information is available at{" "}
            <strong>[CONTACT_EMAIL_PLACEHOLDER]</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            2. Information We Collect
          </h2>
          <p>Depending on the services you utilize, we may process:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Account Data:</strong> Name, email address, password hash, and profile image.
            </li>
            <li>
              <strong>Session & Security Data:</strong> IP addresses, browser user agent strings,
              and authentication timestamps.
            </li>
            <li>
              <strong>Workspace & Application Data:</strong> User-created content, configuration
              settings, and resource metadata.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold text-[var(--foreground)]">
            3. Data Retention and Deletion
          </h2>
          <p>
            We retain your information for as long as your account remains active or as needed to
            provide our services. You may request deletion of your account and personal records at
            any time by contacting <strong>[CONTACT_EMAIL_PLACEHOLDER]</strong>.
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
