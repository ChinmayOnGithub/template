/*
 * handler.ts
 * Wraps Next.js App Router route handlers with error boundaries and request IDs.
 * Ensures uniform correlation tracking and prevents unhandled server crashes.
 */

import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { apiError } from "./response";

export interface RequestContext {
  requestId: string;
  startTime: number;
}

export type RouteHandler = (req: NextRequest, ctx: RequestContext) => Promise<Response> | Response;

export function createApiHandler(handler: RouteHandler) {
  return async (req: NextRequest): Promise<Response> => {
    const incomingId = req.headers.get("x-request-id");
    const requestId = incomingId || crypto.randomUUID();
    const startTime = Date.now();

    const ctx: RequestContext = {
      requestId,
      startTime,
    };

    try {
      const response = await handler(req, ctx);
      // Ensure request-id header is preserved on successful response
      if (!response.headers.has("x-request-id")) {
        response.headers.set("x-request-id", requestId);
      }
      return response;
    } catch (error) {
      return apiError(error, undefined, requestId);
    }
  };
}
