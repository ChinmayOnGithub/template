/*
 * page.tsx
 * Authentication reset password page component.
 * Validates new credentials and resets password via Better Auth token.
 */

"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { FormField, FormLabel, FormControl } from "@/design-system/components/FormField";
import { Card, CardHeader, CardBody, CardFooter } from "@/design-system/components/Card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!token) {
      setError("Missing or invalid password reset token");
      return;
    }

    setLoading(true);

    try {
      const res = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (res.error) {
        setError(res.error.message || "Failed to reset password");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch {
      setError("An unexpected error occurred while resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <h2 className="text-base font-semibold text-[var(--foreground)]">Create new password</h2>
        </CardHeader>

        <CardBody className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-400">
              Password successfully updated. Redirecting to login...
            </div>
          )}

          <FormField>
            <FormLabel htmlFor="new-password">New password</FormLabel>
            <FormControl>
              <Input
                id="new-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
              />
            </FormControl>
          </FormField>

          <FormField>
            <FormLabel htmlFor="confirm-password">Confirm new password</FormLabel>
            <FormControl>
              <Input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </FormControl>
          </FormField>
        </CardBody>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" variant="primary" className="w-full" disabled={loading || success}>
            {loading ? "Updating password..." : "Set new password"}
          </Button>

          <div className="text-center text-xs text-[var(--muted-foreground)]">
            Remember your password?{" "}
            <Link href="/login" className="text-[var(--accent)] hover:underline">
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Reset Password
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Enter your new credentials below</p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-sm text-[var(--muted-foreground)]">Loading...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
