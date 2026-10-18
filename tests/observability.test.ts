/*
 * observability.test.ts
 * Unit tests for structured logger and sensitive field redaction.
 * Asserts removal of passwords, authorization headers, and secret credentials.
 */

import { describe, it, expect } from "vitest";
import { Logger, redactSensitiveData } from "../lib/observability";

describe("Sensitive Data Redaction", () => {
  it("redacts passwords, tokens, and secrets from objects", () => {
    const input = {
      userId: "usr_123",
      email: "user@example.com",
      password: "SuperSecretPassword123",
      token: "jwt_token_secret_value",
      nested: {
        apiKey: "sk_live_12345",
        publicData: "visible",
      },
    };

    const redacted = redactSensitiveData(input) as Record<string, unknown>;
    expect(redacted.userId).toBe("usr_123");
    expect(redacted.email).toBe("user@example.com");
    expect(redacted.password).toBe("[REDACTED]");
    expect(redacted.token).toBe("[REDACTED]");
    expect((redacted.nested as Record<string, unknown>).apiKey).toBe("[REDACTED]");
    expect((redacted.nested as Record<string, unknown>).publicData).toBe("visible");
  });

  it("redacts bearer tokens in string messages", () => {
    const raw = "Request failed with Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.test";
    const cleaned = redactSensitiveData(raw);
    expect(cleaned).toBe("Request failed with Authorization: Bearer [REDACTED]");
  });
});

describe("Structured Logger", () => {
  it("creates structured log entry with timestamp and level", () => {
    const logger = new Logger();
    const entry = logger.info("User logged in", { userId: "usr_99" }, "req_123");

    expect(entry.level).toBe("info");
    expect(entry.message).toBe("User logged in");
    expect(entry.requestId).toBe("req_123");
    expect(entry.timestamp).toBeDefined();
    expect(entry.context).toEqual({ userId: "usr_99" });
  });
});
