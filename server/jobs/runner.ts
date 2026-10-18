/*
 * runner.ts
 * Background job execution engine with retry loop and backoff calculation.
 * Ensures bounded retries, idempotency preservation, and error logging.
 */

import crypto from "node:crypto";
import { JobContext, JobDefinition, isRetryableError } from "./types";

export interface JobRunResult {
  jobId: string;
  name: string;
  success: boolean;
  attempts: number;
  error?: string;
}

export class JobRunner {
  private registry = new Map<string, JobDefinition>();
  private completedRuns: JobRunResult[] = [];

  register<T>(definition: JobDefinition<T>): void {
    this.registry.set(definition.name, definition as JobDefinition);
  }

  async dispatch<T>(
    jobName: string,
    payload: T,
    options: { idempotencyKey?: string; waitOnRetry?: boolean } = {},
  ): Promise<JobRunResult> {
    const job = this.registry.get(jobName);
    if (!job) {
      throw new Error(`[JOBS] No job handler registered for "${jobName}"`);
    }

    const jobId = `job_${crypto.randomUUID().slice(0, 8)}`;
    const maxRetries = job.maxRetries ?? 3;
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt <= maxRetries) {
      attempt++;
      const ctx: JobContext = {
        jobId,
        attempt,
        maxRetries,
        ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
        timestamp: Date.now(),
      };

      try {
        await job.handler(payload, ctx);
        const result: JobRunResult = {
          jobId,
          name: jobName,
          success: true,
          attempts: attempt,
        };
        this.completedRuns.push(result);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const retryable = isRetryableError(lastError);

        if (!retryable || attempt > maxRetries) {
          break;
        }

        if (options.waitOnRetry) {
          const backoff =
            (job.initialBackoffMs ?? 10) * Math.pow(job.backoffMultiplier ?? 2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, backoff));
        }
      }
    }

    const failedResult: JobRunResult = {
      jobId,
      name: jobName,
      success: false,
      attempts: attempt,
      ...(lastError?.message ? { error: lastError.message } : {}),
    };
    this.completedRuns.push(failedResult);
    return failedResult;
  }

  getCompletedRuns(): JobRunResult[] {
    return [...this.completedRuns];
  }

  clearHistory(): void {
    this.completedRuns = [];
  }
}

export const jobRunner = new JobRunner();
