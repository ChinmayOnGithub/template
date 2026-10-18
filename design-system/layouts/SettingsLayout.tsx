/*
 * SettingsLayout.tsx
 * Renders tabbed or sidebar-oriented layout for application settings and configuration.
 * Standardizes account, billing, security, and preferences settings sections.
 */

"use client";

import React from "react";
import Link from "next/link";
import { PageHeader } from "../components/PageHeader";

export interface SettingsTab {
  id: string;
  label: string;
  href: string;
  active?: boolean;
}

export interface SettingsLayoutProps {
  title?: string;
  description?: string;
  tabs: SettingsTab[];
  children: React.ReactNode;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title = "Settings",
  description = "Manage your account, team members, billing preferences, and security.",
  tabs,
  children,
}) => {
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={description} />

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-56 shrink-0">
          <nav
            className="flex flex-row gap-1 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0"
            aria-label="Settings Navigation"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  tab.active
                    ? "bg-[var(--accent)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)]"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Settings Body */}
        <div className="flex-1 max-w-4xl">{children}</div>
      </div>
    </div>
  );
};
