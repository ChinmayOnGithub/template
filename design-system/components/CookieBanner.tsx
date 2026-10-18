/*
 * CookieBanner.tsx
 * Interactive cookie consent banner and preference customization dialog.
 * Prevents non-essential tracking initialization until explicit user consent is recorded.
 */

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getStoredConsent, saveConsent, ConsentPreferences } from "@/lib/consent";
import { Button } from "./Button";

export function CookieBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setMounted(true);
    const existing = getStoredConsent();
    if (!existing) {
      setVisible(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }

    const handleConsentEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ConsentPreferences>;
      if (customEvent.detail) {
        setAnalytics(customEvent.detail.analytics);
        setMarketing(customEvent.detail.marketing);
      }
    };

    window.addEventListener("cookie_consent_updated", handleConsentEvent);
    return () => {
      window.removeEventListener("cookie_consent_updated", handleConsentEvent);
    };
  }, []);

  if (!mounted || !visible) return null;

  const handleAcceptAll = () => {
    saveConsent({ analytics: true, marketing: true });
    setVisible(false);
    setShowPreferences(false);
  };

  const handleRejectOptional = () => {
    saveConsent({ analytics: false, marketing: false });
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSaveCustom = () => {
    saveConsent({ analytics, marketing });
    setVisible(false);
    setShowPreferences(false);
  };

  return (
    <aside aria-label="Cookie consent" className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-2xl backdrop-blur-md">
        {!showPreferences ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-sm font-semibold text-[var(--foreground)]">Cookie Preferences</h2>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                We use cookies and essential storage technologies to ensure basic site
                functionality, maintain secure sessions, and analyze anonymized usage. Read our{" "}
                <Link href="/cookies" className="text-[var(--accent)] hover:underline">
                  Cookie Policy
                </Link>{" "}
                for details.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(true)}>
                Customize
              </Button>
              <Button variant="secondary" size="sm" onClick={handleRejectOptional}>
                Reject optional
              </Button>
              <Button variant="primary" size="sm" onClick={handleAcceptAll}>
                Accept all
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="border-b border-[var(--border)] pb-3">
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Manage Cookie Preferences
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Customize your tracking permissions. Strictly necessary cookies cannot be disabled
                as they are required for site operation.
              </p>
            </div>

            <div className="space-y-3">
              {/* Strictly Necessary */}
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--foreground)]">
                    Strictly Necessary
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Required for session state, authentication, and core security.
                  </p>
                </div>
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--foreground)]">
                    Analytics & Performance
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Helps us understand product usage to improve performance and stability.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-analytics"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
              </div>

              {/* Marketing */}
              <div className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3">
                <div>
                  <h3 className="text-xs font-semibold text-[var(--foreground)]">
                    Marketing & Targeting
                  </h3>
                  <p className="text-[11px] text-[var(--muted-foreground)]">
                    Allows personalized announcements and external campaign tracking.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="consent-marketing"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[var(--border)] pt-3">
              <Button variant="ghost" size="sm" onClick={() => setShowPreferences(false)}>
                Back
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveCustom}>
                Save Preferences
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
