/*
 * auth-client.ts
 * Browser-side Better Auth client instance for React components and hooks.
 * Provides typed sign-in, sign-up, sign-out, and active session subscription.
 */

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

export const { signIn, signUp, signOut, useSession } = authClient;
