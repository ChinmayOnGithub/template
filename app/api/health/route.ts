/*
 * route.ts
 * Liveness health probe endpoint returning application runtime status.
 * Used by container orchestrators and load balancers to assess process viability.
 */

import { apiSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return apiSuccess({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    nodeVersion: process.version,
  });
}
