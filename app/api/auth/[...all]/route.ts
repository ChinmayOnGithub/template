/*
 * route.ts
 * Next.js App Router catch-all route for Better Auth endpoints.
 * Mounts standard authentication, session token, and OAuth callback handlers.
 */

import { auth } from "@/features/auth/better-auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

export const { GET, POST } = toNextJsHandler(auth);
