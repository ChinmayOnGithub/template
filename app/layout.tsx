/*
 * layout.tsx
 * Root layout component for the Next.js App Router application.
 * Establishes HTML shell, metadata, Genesis typography links, and global stylesheets.
 */

import type { Metadata } from "next";
import "./globals.css";
import { constructMetadata } from "@/lib/seo/config";
import { CookieBanner } from "@/design-system/components/CookieBanner";

export const metadata: Metadata = constructMetadata();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-body antialiased selection:bg-[var(--primary)]/20">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
