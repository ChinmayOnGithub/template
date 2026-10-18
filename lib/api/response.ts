/*
 * response.ts
 * Standardized API response envelopes and serialization helpers.
 * Guarantees predictable JSON shapes for successful data and error payloads.
 */

import { AppError } from "./errors";

export interface ApiSuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export type ApiResponseEnvelope<T> = ApiSuccessEnvelope<T> | ApiErrorEnvelope;

export function apiSuccess<T>(
  data: T,
  meta?: Record<string, unknown>,
  status = 200,
  headers?: HeadersInit,
): Response {
  const payload: ApiSuccessEnvelope<T> = {
    success: true,
    data,
    ...(meta ? { meta } : {}),
  };

  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/json");
  }

  return new Response(JSON.stringify(payload), {
    status,
    headers: responseHeaders,
  });
}

export function apiError(
  error: unknown,
  statusOverride?: number,
  requestId?: string,
  headers?: HeadersInit,
): Response {
  let statusCode = statusOverride ?? 500;
  let code = "INTERNAL_ERROR";
  let message = "An unexpected error occurred";
  let details: unknown = undefined;

  if (error instanceof AppError) {
    statusCode = statusOverride ?? error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = process.env.NODE_ENV === "production" ? "Internal server error" : error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  const payload: ApiErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(requestId ? { requestId } : {}),
    },
  };

  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("Content-Type")) {
    responseHeaders.set("Content-Type", "application/json");
  }
  if (requestId) {
    responseHeaders.set("x-request-id", requestId);
  }

  return new Response(JSON.stringify(payload), {
    status: statusCode,
    headers: responseHeaders,
  });
}
