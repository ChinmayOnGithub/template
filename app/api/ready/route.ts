/*
 * route.ts
 * Readiness probe endpoint validating critical external dependency availability.
 * Asserts database readiness with bounded timeouts without disclosing internal secrets.
 */

import { apiError, apiSuccess } from "@/lib/api";
import { db, isDatabaseConfigured } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  if (!isDatabaseConfigured()) {
    return apiError("Service unavailable: database dependency is not configured.", 503);
  }

  try {
    // 2000ms timeout guard on real database connection
    await Promise.race([
      db.$connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database readiness probe timed out")), 2000),
      ),
    ]);

    return apiSuccess({
      ready: true,
      timestamp: new Date().toISOString(),
      dependencies: {
        database: "connected",
      },
    });
  } catch (_error) {
    return apiError("Service unavailable: database readiness check failed or timed out.", 503);
  }
}
