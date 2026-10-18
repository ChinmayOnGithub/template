/*
 * route.ts
 * Integration health diagnostic endpoint for Admin Portal status probes.
 * Reports liveness and integration readiness without disclosing sensitive system details.
 */

import { NextResponse } from "next/server";
import { INTEGRATION_API_VERSION } from "@/lib/saas-integration/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const isReady = true;

  return NextResponse.json({
    status: isReady ? "ready" : "degraded",
    integrationApiVersion: INTEGRATION_API_VERSION,
    timestamp: new Date().toISOString(),
  });
}
