/*
 * route.ts
 * Inbound integration event endpoint receiving verified commands from Admin Portal.
 * Fails closed until events can be durably queued and replay-protected across instances.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSignature } from "@/lib/saas-integration/auth";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === "production") {
      // A 202 response would imply durable acceptance, which is not implemented yet.
      return NextResponse.json(
        { error: "Durable integration event processing is not configured." },
        { status: 503 },
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-integration-signature") || "";
    const signingKey = process.env.ADMIN_PORTAL_SIGNING_PUBLIC_KEY;
    const developmentSecret = process.env.ADMIN_PORTAL_SIGNING_SECRET;
    const key = signingKey || developmentSecret;

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

    logger.info("Authenticated inbound portal event (development only)", {
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
