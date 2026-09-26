# Idempotency and Retry Guidelines (IDEMPOTENCY.md)

This document establishes standards for network retries, background jobs, webhooks, and mutating operations to prevent duplicate executions and inconsistent state.

---

## 1. The Core Idempotency Rule

Any operation that can be retried due to network drops, timeouts, process restarts, or queue deliveries must be evaluated for duplicate side effects:
- An idempotent operation produces the exact same resulting state whether it is executed once or multiple times with the same parameters.
- If an operation cannot be made naturally idempotent, it must enforce idempotency via an **Idempotency Key**.

---

## 2. High-Risk Operations Requiring Idempotency

1. **Financial and Entitlement Mutations**:
   - Subscriptions, payment capture, balance deductions, license issuing.
   - Mechanism: Require client-supplied `Idempotency-Key` header; store transaction hash and response for 24 hours.
2. **External API Calls and Webhooks**:
   - Outbound webhooks, third-party provider sync (Google Calendar, Stripe, GitHub).
   - Mechanism: Store incoming webhook `event_id` in a processed events table before execution. Reject duplicate event IDs.
3. **Background Jobs and Queue Processors**:
   - Asynchronous tasks in BullMQ, Celery, or cron workers.
   - Mechanism: Use deterministic job IDs based on entity ID and timestamp interval; ensure job handlers are re-entrant.
4. **File Uploads and S3/Blob Storage**:
   - Multi-part uploads or large file streaming.
   - Mechanism: Compute SHA-256 or use deterministic content-addressed storage keys.
5. **Database State Mutations**:
   - Use `upsert` or conditional writes (`UPDATE ... WHERE status = 'pending'`) instead of raw blind `INSERT` or unscoped increments.

---

## 3. Standard Retry Strategy

When designing retries for network or database transient failures:
1. **Exponential Backoff with Jitter**:
   Never retry immediately in a tight loop. Use exponential backoff (e.g. 500ms, 1000ms, 2000ms) with randomized jitter to prevent thundering herd problems.
2. **Bounded Retry Counts**:
   Limit retries to 3 attempts. If all retries fail, move the task to a Dead Letter Queue (DLQ) or return a typed failure to the caller.
3. **Only Retry Transient Errors**:
   - Retry: 408 Request Timeout, 429 Too Many Requests (respecting `Retry-After`), 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout, network socket drops.
   - Do NOT Retry: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable Entity.
