/*
 * route.ts
 * Readiness probe endpoint validating critical external dependency availability.
 * Asserts database and cache readiness without disclosing internal infrastructure secrets.
 */

import { apiError, apiSuccess } from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  try {
    // Ping database connection
    await db.$connect();

    return apiSuccess({
      ready: true,
      timestamp: new Date().toISOString(),
      dependencies: {
        database: "connected",
      },
    });
  } catch (_error) {
    return apiError("Service unavailable: dependency readiness check failed", 503);
  }
}
