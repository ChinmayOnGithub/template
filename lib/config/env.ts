/*
 * env.ts
 * Strict runtime environment variable validation for application configuration.
 * Prevents insecure defaults in production and enforces required secrets at startup.
 */

import { z } from "zod";
import crypto from "node:crypto";

const EnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
    AUTH_SECRET: z
      .string()
      .min(16)
      .default("dev_fallback_secret_must_not_be_used_in_production_32b"),
    DATABASE_URL: z.string().optional(),
    INITIAL_ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PORTAL_URL: z.string().url().optional(),
    ADMIN_PORTAL_CLIENT_ID: z.string().optional(),
    ADMIN_PORTAL_CLIENT_SECRET: z.string().optional(),
    ADMIN_PORTAL_SIGNING_SECRET: z.string().optional(),
    PRODUCT_ID: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return (
          data.AUTH_SECRET !== "dev_fallback_secret_must_not_be_used_in_production_32b" &&
          data.AUTH_SECRET.length >= 32
        );
      }
      return true;
    },
    {
      message:
        "AUTH_SECRET must be configured with a 32+ character high-entropy string in production.",
      path: ["AUTH_SECRET"],
    },
  )
  .refine(
    (data) => {
      if (data.NODE_ENV === "production") {
        return data.NEXT_PUBLIC_APP_URL.startsWith("https://");
      }
      return true;
    },
    {
      message: "NEXT_PUBLIC_APP_URL must use HTTPS in production environments.",
      path: ["NEXT_PUBLIC_APP_URL"],
    },
  );

export type EnvConfig = z.infer<typeof EnvSchema>;

let validatedEnv: EnvConfig;

export function getEnv(): EnvConfig {
  if (!validatedEnv) {
    const parsed = EnvSchema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .map((i) => ` - ${i.path.join(".")}: ${i.message}`)
        .join("\n");
      throw new Error(`[CONFIG ERROR] Invalid environment configuration:\n${issues}`);
    }
    validatedEnv = parsed.data;
  }
  return validatedEnv;
}

export function generateDevelopmentSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}
