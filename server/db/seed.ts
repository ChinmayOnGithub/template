/*
 * seed.ts
 * Seed data runner for local development and integration testing.
 * Seeds baseline administrative users and subscription plans safely.
 */

import { db, isDatabaseConfigured, DatabaseNotConfiguredError } from "./client";

export interface SeedData {
  adminEmail: string;
  adminName: string;
}

export async function runDatabaseSeed(
  data: SeedData = {
    adminEmail: "admin@example.com",
    adminName: "Default Administrator",
  },
): Promise<{ success: boolean; seededUser: string; userId: string }> {
  if (process.env.NODE_ENV === "production" && !process.env.ALLOW_PRODUCTION_SEED) {
    throw new Error(
      "[SEED] Running database seed against production is prohibited without ALLOW_PRODUCTION_SEED=true",
    );
  }

  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError("[SEED] Cannot run seed without DATABASE_URL configured.");
  }

  // Connect and verify connection
  await db.$connect();

  // Create or upsert administrative user record
  const seeded = await db.user.upsert({
    where: { email: data.adminEmail },
    update: {
      role: "admin",
      status: "active",
      emailVerified: true,
    },
    create: {
      email: data.adminEmail,
      name: data.adminName,
      role: "admin",
      status: "active",
      emailVerified: true,
    },
  });

  return {
    success: true,
    seededUser: seeded.email,
    userId: seeded.id,
  };
}

// CLI execution
if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  runDatabaseSeed()
    .then((res) => {
      console.warn(
        `[SEED] Database seed completed successfully for: ${res.seededUser} (${res.userId})`,
      );
      process.exit(0);
    })
    .catch((err) => {
      console.error(`[SEED ERROR] ${err.message}`);
      process.exit(1);
    });
}
