/*
 * better-auth.ts
 * Server-side Better Auth initialization and configuration.
 * Configures authentication lifecycle, Prisma adapter, rate limiting, and session verification.
 */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db, isDatabaseConfigured } from "@/server/db";
import { sendPasswordResetEmail } from "@/server/email";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/errors";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const isProd = process.env.NODE_ENV === "production";
const isBuild = process.env.NEXT_PHASE === "phase-production-build";
const envSecret = process.env.AUTH_SECRET;
if (isProd && !isBuild) {
  if (
    !envSecret ||
    envSecret === "dev_fallback_secret_must_not_be_used_in_production_32b" ||
    envSecret.length < 32
  ) {
    throw new Error(
      "[AUTH] Valid AUTH_SECRET with at least 32 characters is required in production mode.",
    );
  }
}
const authSecret = envSecret || "dev_fallback_secret_must_not_be_used_in_production_32b";

export const auth = betterAuth({
  baseURL: appUrl,
  secret: authSecret,
  ...(isDatabaseConfigured()
    ? {
        database: prismaAdapter(db, {
          provider: "postgresql",
        }),
      }
    : {}),
  rateLimit: {
    window: 60,
    max: 100,
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
        ...(user.name ? { userName: user.name } : {}),
      });
    },
  },
  socialProviders: {
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
      ? {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false, // Strips role from public user input to prevent privilege escalation
      },
      status: {
        type: "string",
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
          const userEmail = user.email.trim().toLowerCase();

          // Safe administrator bootstrap: designate initial admin only if configured and no admin exists yet
          if (initialAdminEmail && userEmail === initialAdminEmail) {
            if (isDatabaseConfigured()) {
              const existingAdmin = await db.user.findFirst({
                where: { role: "admin" },
                select: { id: true },
              });
              if (!existingAdmin) {
                return {
                  data: {
                    ...user,
                    role: "admin",
                  },
                };
              }
            } else {
              return { data: { ...user, role: "admin" } };
            }
          }
          return { data: user };
        },
      },
    },
  },
});

export type Auth = typeof auth;

export async function getServerSession() {
  const { headers } = await import("next/headers");
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireServerSession() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new UnauthorizedError("Authentication required to access this resource.");
  }
  return session;
}

export async function requireAdminSession() {
  const session = await requireServerSession();
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    throw new ForbiddenError("Administrator privileges required for this operation.");
  }
  return session;
}
