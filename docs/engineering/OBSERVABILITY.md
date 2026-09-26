# Observability and Telemetry (OBSERVABILITY.md)

This document establishes standards for application logging, metrics, request tracing, and health monitoring.

---

## 1. Structured Logging Standards

1. **Format**: Emit structured JSON logs in production to enable machine ingestion, filtering, and indexing.
2. **Context Enrichment**: Every log entry should include:
   - `timestamp`: ISO-8601 UTC timestamp.
   - `level`: `debug`, `info`, `warn`, `error`, `fatal`.
   - `message`: Human-readable summary of the event (no emojis, no em dashes).
   - `traceId` / `requestId`: Correlation ID passed across service and API boundaries.
   - `userId` / `tenantId`: Active tenant context where applicable.
3. **Log Levels**:
   - `DEBUG`: Diagnostic execution traces (disabled in production by default).
   - `INFO`: Normal business milestones (e.g. "User session authenticated", "Export completed").
   - `WARN`: Recoverable degradation, unexpected input, or rate-limiting events.
   - `ERROR`: Unhandled exceptions, failed transactions, broken external dependencies.
   - `FATAL`: System-level crash or unrecoverable termination.
4. **Prohibition of Sensitive Data**:
   Never log passwords, API tokens, session cookies, credit card details, encryption keys, or sensitive personally identifiable information (PII).

---

## 2. Request Correlation and Tracing

- Every inbound HTTP request or message queue delivery must be assigned a unique `traceId` (UUIDv4 or W3C Trace Context).
- Propagate the `traceId` through all downstream service calls, database transactions, and background tasks.
- Return the `traceId` in error responses to clients to enable cross-referencing user bug reports with server logs.

---

## 3. Health Checks and Readiness Probes

Expose explicit health check endpoints for container and platform monitoring:
- **Liveness Probe** (`/api/healthz` or `/health`): Returns HTTP 200 if the process is responsive and event loop is not blocked.
- **Readiness Probe** (`/api/ready`): Returns HTTP 200 only if critical backing services (database connection pool, Redis cache) are reachable.

---

## 4. Business Metrics and Diagnostics

Instrument critical business paths with counters and histograms:
- Request duration latency percentiles (p50, p95, p99).
- Background worker queue depth and job processing duration.
- Authentication failure frequency and rate limit threshold hits.
