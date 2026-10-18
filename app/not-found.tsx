/*
 * not-found.tsx
 * Custom 404 error page component.
 * Provides accessible navigation and clear guidance when requested path does not exist.
 */

import Link from "next/link";
import { Button } from "@/design-system/components/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-4xl font-extrabold text-[var(--accent)]">404</span>
        <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          The requested resource could not be found or has been moved to a new URL.
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button variant="primary">Return Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
