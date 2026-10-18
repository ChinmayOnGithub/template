/*
 * page.tsx
 * Password recovery request page component.
 * Dispatches password reset instructions via Better Auth without account enumeration.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/features/auth/auth-client";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { FormField, FormLabel, FormControl } from "@/design-system/components/FormField";
import { Card, CardHeader, CardBody, CardFooter } from "@/design-system/components/Card";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (res.error) {
        setError(res.error.message || "Failed to process password reset request.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("An unexpected error occurred while requesting password reset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Reset password
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Enter your email to receive recovery instructions
          </p>
        </div>

        <Card>
          {submitted ? (
            <div className="p-6 space-y-4 text-center">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs text-emerald-400">
                If an account matches this email, password reset instructions have been dispatched.
              </div>
              <Link
                href="/login"
                className="inline-block text-xs text-[var(--accent)] hover:underline"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <h2 className="text-base font-semibold text-[var(--foreground)]">
                  Request password recovery
                </h2>
              </CardHeader>

              <CardBody className="space-y-4">
                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    {error}
                  </div>
                )}

                <FormField>
                  <FormLabel htmlFor="email">Email address</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                  </FormControl>
                </FormField>
              </CardBody>

              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send instructions"}
                </Button>

                <div className="text-center text-xs text-[var(--muted-foreground)]">
                  Remembered your password?{" "}
                  <Link href="/login" className="text-[var(--accent)] hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
