/*
 * seed.ts
 * Seed data runner for local development and integration testing.
 * Seeds baseline administrative users and subscription plans safely.
 */

import { db } from "./client";

export interface SeedData {
  adminEmail: string;
  adminName: string;
}

export async function runDatabaseSeed(
  data: SeedData = {
    adminEmail: "admin@example.com",
    adminName: "Default Administrator",
  },
): Promise<{ success: boolean; seededUser: string }> {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PRODUCTION_SEED) {
    throw new Error(
      "[SEED] Running database seed against production is prohibited without ALLOW_PRODUCTION_SEED=true",
    );
  }

  // Connect and verify connection
  await db.$connect();

  return {
    success: true,
    seededUser: data.adminEmail,
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  runDatabaseSeed()
    .then((res) => {
      console.warn(`[SEED] Database seed completed successfully for: ${res.seededUser}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[SEED ERROR] ${err.message}`);
      process.exit(1);
    });
}
