/*
 * route.ts
 * Inbound integration event endpoint receiving verified commands from Admin Portal.
 * Durably records accepted events to database and fails closed in production without storage.
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyPortalSignature } from "@/features/integrations/auth";
import { logger } from "@/lib/observability/logger";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
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

    const eventId = parsed.eventId || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const eventType = parsed.eventType || "unknown";

    if (process.env.DATABASE_URL) {
      try {
        await db.webhookEvent.upsert({
          where: { eventId },
          update: {
            status: "accepted",
            processedAt: new Date(),
          },
          create: {
            provider: "admin_portal",
            eventId,
            eventType,
            payload: parsed as Prisma.InputJsonValue,
            status: "accepted",
          },
        });
      } catch (dbErr) {
        logger.error("Failed to durably record integration event", {
          error: (dbErr as Error).message,
        });
        if (process.env.NODE_ENV === "production") {
          return NextResponse.json(
            { error: "Durable integration event storage is unavailable." },
            { status: 503 },
          );
        }
      }
    } else if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Durable integration event processing is not configured." },
        { status: 503 },
      );
    }

    logger.info("Authenticated and recorded inbound portal event", {
      eventId,
      eventType,
    });

    const syncParam = req.nextUrl.searchParams.get("sync");
    const shouldProcessSync =
      syncParam === "true" || process.env.AUTO_PROCESS_INTEGRATION_EVENTS === "true";

    let processed = false;
    if (shouldProcessSync) {
      const { processInboundPortalEvent } = await import("@/lib/saas-integration/worker");
      const processResult = await processInboundPortalEvent({
        eventId,
        eventType,
        payload: parsed,
      });
      processed = processResult.success;
    }

    return NextResponse.json(
      {
        accepted: true,
        eventId,
        processed,
        status: processed ? "completed" : "accepted",
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
