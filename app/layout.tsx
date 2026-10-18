/*
 * layout.tsx
 * Root layout component for the Next.js App Router application.
 * Establishes HTML shell, metadata, and global stylesheets.
 */

import type { Metadata } from "next";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/config";
import { CookieBanner } from "@/design-system/components/CookieBanner";

export const metadata: Metadata = constructMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
