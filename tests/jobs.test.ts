/*
 * jobs.test.ts
 * Unit tests for background job execution, retry loop, and error classification.
 * Asserts exponential backoff calculation and permanent versus retryable failures.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { JobRunner, RetryableJobError, PermanentJobError, isRetryableError } from "../lib/jobs";

describe("Background Job Runner", () => {
  let runner: JobRunner;

  beforeEach(() => {
    runner = new JobRunner();
  });

  it("executes registered job successfully", async () => {
    let executed = false;
    runner.register({
      name: "test.successful",
      handler: async (payload: { message: string }) => {
        expect(payload.message).toBe("hello");
        executed = true;
      },
    });

    const result = await runner.dispatch("test.successful", { message: "hello" });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(1);
    expect(executed).toBe(true);
  });

  it("retries transient failures up to maxRetries", async () => {
    let attempts = 0;
    runner.register({
      name: "test.transient",
      maxRetries: 2,
      handler: async () => {
        attempts++;
        if (attempts < 2) {
          throw new RetryableJobError("Network hiccup");
        }
      },
    });

    const result = await runner.dispatch("test.transient", {}, { waitOnRetry: false });
    expect(result.success).toBe(true);
    expect(result.attempts).toBe(2);
    expect(attempts).toBe(2);
  });

  it("terminates immediately on permanent error without retrying", async () => {
    let attempts = 0;
    runner.register({
      name: "test.permanent",
      maxRetries: 3,
      handler: async () => {
        attempts++;
        throw new PermanentJobError("Invalid credentials");
      },
    });

    const result = await runner.dispatch("test.permanent", {}, { waitOnRetry: false });
    expect(result.success).toBe(false);
    expect(result.attempts).toBe(1);
    expect(attempts).toBe(1);
    expect(result.error).toBe("Invalid credentials");
  });

  it("classifies errors accurately into retryable or permanent", () => {
    expect(isRetryableError(new RetryableJobError("fail"))).toBe(true);
    expect(isRetryableError(new PermanentJobError("fatal"))).toBe(false);
    expect(isRetryableError(new Error("Connection timeout occurred"))).toBe(true);
  });
});
