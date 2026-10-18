/*
 * types.ts
 * Type definitions and error classifications for background job tasks.
 * Defines retryable versus permanent failure semantics and job execution context.
 */

export interface JobContext {
  jobId: string;
  attempt: number;
  maxRetries: number;
  idempotencyKey?: string;
  timestamp: number;
}

export type JobHandler<T = unknown> = (payload: T, ctx: JobContext) => Promise<void> | void;

export interface JobDefinition<T = unknown> {
  name: string;
  handler: JobHandler<T>;
  maxRetries?: number;
  initialBackoffMs?: number;
  backoffMultiplier?: number;
}

export class PermanentJobError extends Error {
  public readonly isPermanent = true;
  constructor(message: string) {
    super(message);
    this.name = "PermanentJobError";
  }
}

export class RetryableJobError extends Error {
  public readonly isPermanent = false;
  constructor(message: string) {
    super(message);
    this.name = "RetryableJobError";
  }
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof PermanentJobError) return false;
  if (error instanceof RetryableJobError) return true;
  // Network errors and timeouts are default retryable
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("econnrefused") || msg.includes("econnreset")) {
      return true;
    }
  }
  return true;
}
