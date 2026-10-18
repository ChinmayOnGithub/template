/*
 * client.ts
 * Server-only client for communicating with the centralized Admin Portal.
 * Implements bounded retries, TLS enforcement, and normalized error handling.
 */

import {
  type ProductManifest,
  type ProductEvent,
  type EntitlementSnapshot,
  type HandshakeResponse,
} from "./types";
import {
  validateProductManifest,
  validateProductEvent,
  validateEntitlementSnapshot,
} from "./contract";

export interface PortalClientConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  timeoutMs?: number;
  maxRetries?: number;
  transport?: (url: string, init: RequestInit) => Promise<Response>;
}

export class IntegrationError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false,
    public readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = "IntegrationError";
  }
}

export function validatePortalBaseUrl(baseUrl: string, environment = process.env.NODE_ENV): URL {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(baseUrl);
  } catch {
    throw new Error("AdminPortalClient baseUrl must be a valid absolute URL");
  }

  const isLocalHttp =
    parsedUrl.protocol === "http:" &&
    ["localhost", "127.0.0.1", "::1"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !(environment !== "production" && isLocalHttp)) {
    throw new Error("AdminPortalClient requires HTTPS outside local development");
  }
  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("AdminPortalClient baseUrl must not contain URL credentials");
  }
  return parsedUrl;
}

export class AdminPortalClient {
  private baseUrl: string;
  private clientId: string;
  private clientSecret: string;
  private timeoutMs: number;
  private maxRetries: number;
  private transport: (url: string, init: RequestInit) => Promise<Response>;

  constructor(config: PortalClientConfig) {
    if (!config.baseUrl || !config.clientId || !config.clientSecret) {
      throw new Error(
        "AdminPortalClient requires baseUrl, clientId, and clientSecret to be configured",
      );
    }

    const parsedUrl = validatePortalBaseUrl(config.baseUrl);
    this.baseUrl = parsedUrl.toString().replace(/\/+$/, "");
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.timeoutMs = config.timeoutMs ?? 5000;
    this.maxRetries = config.maxRetries ?? 3;
    this.transport = config.transport ?? fetch;
  }

  private async requestWithRetry<T>(
    endpoint: string,
    method: string,
    body?: unknown,
    options: { idempotencyKey?: string; correlationId?: string } = {},
  ): Promise<T> {
    const url = new URL(endpoint, `${this.baseUrl}/`);
    if (url.origin !== new URL(this.baseUrl).origin) {
      throw new IntegrationError("Admin Portal endpoint escaped configured origin", 400, false);
    }

    let attempt = 0;
    const correlationId =
      options.correlationId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          "x-integration-client-id": this.clientId,
          Authorization: `Bearer ${this.clientSecret}`,
          "x-correlation-id": correlationId,
        };

        if (options.idempotencyKey) headers["x-idempotency-key"] = options.idempotencyKey;

        const res = await this.transport(url.toString(), {
          method,
          headers,
          ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.ok) return (await res.json()) as T;

        const status = res.status;
        let retryAfterSeconds: number | undefined;
        const retryHeader = res.headers.get("retry-after");
        if (retryHeader) {
          const parsed = Number.parseInt(retryHeader, 10);
          if (Number.isFinite(parsed) && parsed >= 0) retryAfterSeconds = parsed;
        }

        const isRetryable = status === 429 || (status >= 500 && status <= 599);
        const errorText = await res.text().catch(() => "");

        if (!isRetryable || attempt > this.maxRetries) {
          throw new IntegrationError(
            `Admin Portal request failed (${status}): ${errorText}`,
            status,
            isRetryable,
            retryAfterSeconds,
          );
        }

        const delayMs =
          retryAfterSeconds !== undefined
            ? Math.min(retryAfterSeconds * 1000, 10_000)
            : Math.min(100 * Math.pow(2, attempt), 2000);
        await new Promise((resolve) =>
          setTimeout(resolve, delayMs + Math.floor(Math.random() * 50)),
        );
      } catch (err: unknown) {
        clearTimeout(timer);
        if (err instanceof IntegrationError && !err.retryable) throw err;

        const isAbort = (err as { name?: string }).name === "AbortError";
        if (attempt > this.maxRetries) {
          throw new IntegrationError(
            isAbort
              ? `Admin Portal request timed out after ${this.timeoutMs}ms`
              : (err as Error).message,
            isAbort ? 408 : 500,
            false,
          );
        }
        await new Promise((resolve) =>
          setTimeout(resolve, Math.min(100 * Math.pow(2, attempt), 2000)),
        );
      }
    }

    throw new IntegrationError("Max retries exceeded communicating with Admin Portal", 500, false);
  }

  public async registerOrHandshake(manifest: ProductManifest): Promise<HandshakeResponse> {
    const validated = validateProductManifest(manifest);
    return this.requestWithRetry<HandshakeResponse>(
      "/api/v1/products/handshake",
      "POST",
      validated,
      {
        idempotencyKey: `handshake_${validated.productId}_${validated.version}`,
      },
    );
  }

  public async submitEvents(events: ProductEvent[]): Promise<{ acceptedCount: number }> {
    const validated = events.map(validateProductEvent);
    return this.requestWithRetry<{ acceptedCount: number }>("/api/v1/events/batch", "POST", {
      events: validated,
    });
  }

  public async getEntitlements(productId: string, tenantId?: string): Promise<EntitlementSnapshot> {
    const query = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : "";
    const raw = await this.requestWithRetry<unknown>(
      `/api/v1/entitlements/${encodeURIComponent(productId)}${query}`,
      "GET",
    );
    return validateEntitlementSnapshot(raw);
  }

  public async reportHealth(status: {
    liveness: boolean;
    readiness: boolean;
  }): Promise<{ received: boolean }> {
    return this.requestWithRetry<{ received: boolean }>("/api/v1/health/report", "POST", status);
  }
}
