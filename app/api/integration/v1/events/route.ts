/*
 * route.ts
 * Inbound integration event endpoint receiving verified commands from Admin Portal.
 * Rejects requests when the production signing key is not configured.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSignature } from "@/lib/saas-integration/auth";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-integration-signature") || "";
    const signingKey = process.env.ADMIN_PORTAL_SIGNING_PUBLIC_KEY;
    const developmentSecret = process.env.ADMIN_PORTAL_SIGNING_SECRET;

    // Production uses an asymmetric public key. A shared test secret is never a fallback.
    const key = process.env.NODE_ENV === "production" ? signingKey : signingKey || developmentSecret;
    if (!key) {
      return NextResponse.json(
        { error: "Integration signing key is not configured." },
        { status: 503 },
      );
    }

    verifyPortalSignature({
      signatureHeader: signature,
      payload: rawBody,
      keyResolver: () => key,
    });

    const parsed = JSON.parse(rawBody) as { eventId?: string; eventType?: string };
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
    }

    // This endpoint only authenticates and acknowledges. It does not claim durable processing.
    logger.info("Authenticated inbound portal event", {
      eventId: parsed.eventId,
      eventType: parsed.eventType,
    });

    return NextResponse.json(
      {
        accepted: true,
        processed: false,
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
