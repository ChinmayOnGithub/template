/*
 * route.ts
 * Capability discovery endpoint for the SaaS Admin Portal integration.
 * Discloses supported integration operations and API contract version.
 */

import { NextResponse } from "next/server";
import { INTEGRATION_API_VERSION, type IntegrationCapability } from "@/features/integrations/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const capabilities: IntegrationCapability[] = [
    "health.read",
    "events.write",
    "entitlements.read",
  ];

  return NextResponse.json({
    integrationApiVersion: INTEGRATION_API_VERSION,
    capabilities,
  });
}
