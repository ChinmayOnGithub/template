/*
 * route.ts
 * Product manifest endpoint for the central Admin Portal integration.
 * Exposes declared capabilities and feature limits without leaking internal secrets.
 */

import { NextResponse } from "next/server";
import { createDefaultManifest } from "@/lib/saas-integration/contract";

export const dynamic = "force-dynamic";

export async function GET() {
  const manifest = createDefaultManifest();
  return NextResponse.json(manifest);
}
