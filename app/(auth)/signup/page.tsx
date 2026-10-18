/*
 * page.tsx
 * Authentication sign-up page component.
 * Provides accessible user registration form integrated with Better Auth client.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/features/auth/auth-client";
import { Button } from "@/design-system/components/Button";
import { Input } from "@/design-system/components/Input";
import { FormField, FormLabel, FormControl } from "@/design-system/components/FormField";
import { Card, CardHeader, CardBody, CardFooter } from "@/design-system/components/Card";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signUp.email({
        name,
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message || "Failed to create account");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            Create your account
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Get started with your new engineering workspace
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <h2 className="text-base font-semibold text-[var(--foreground)]">
                Sign up for an account
              </h2>
            </CardHeader>

            <CardBody className="space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  {error}
                </div>
              )}

              <FormField>
                <FormLabel htmlFor="name">Full name</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Chinmay"
                  />
                </FormControl>
              </FormField>

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

              <FormField>
                <FormLabel htmlFor="password">Password (minimum 8 characters)</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </FormControl>
              </FormField>
            </CardBody>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>

              <div className="text-center text-xs text-[var(--muted-foreground)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--accent)] hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
