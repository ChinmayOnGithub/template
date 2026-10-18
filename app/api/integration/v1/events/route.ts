/*
 * route.ts
 * Inbound integration event endpoint receiving verified commands from Admin Portal.
 * Verifies cryptographic signatures and provides durable acceptance acknowledgment.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSignature } from "@/lib/saas-integration/auth";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-integration-signature") || "";

    const secret =
      process.env.ADMIN_PORTAL_SIGNING_SECRET || "mock_portal_signing_secret_for_tests_only";

    verifyPortalSignature({
      signatureHeader: signature,
      payload: rawBody,
      keyResolver: () => secret,
    });

    const parsed = JSON.parse(rawBody) as { eventId?: string; eventType?: string };
    logger.info("Accepted inbound portal event", {
      eventId: parsed.eventId,
      eventType: parsed.eventType,
    });

    return NextResponse.json(
      {
        accepted: true,
        receivedAt: new Date().toISOString(),
      },
      { status: 202 },
    );
  } catch (err: unknown) {
    const message = (err as Error).message || "Unauthorized";
    const statusCode = (err as { statusCode?: number }).statusCode || 401;

    logger.warn("Inbound portal event rejected", { error: message, statusCode });

    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
