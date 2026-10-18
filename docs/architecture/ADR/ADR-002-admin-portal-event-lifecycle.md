# ADR-002: Inbound Admin Portal Event Ingestion, Persistence, and Processing Worker

## Status

Accepted

## Context

The centralized Admin Portal integration receives inbound service-to-service commands (such as `entitlements.sync`, `tenant.suspended`, `user.deprovisioned`, and `configuration.changed`).
Previously, the endpoint either stubbed responses or returned HTTP 202 without durable event persistence or worker dispatching.
An HTTP 202 response indicates that an event has been securely accepted into durable storage, but domain side effects may not yet be completed.
To prevent unhandled command failures, message loss, and duplicate side effects, a resilient two-phase event processing architecture is required.

## Decision

We adopt a decoupled two-phase ingestion and worker model:

1. **Phase 1: Ingestion and Durable Receipt (`/api/integration/v1/events`)**
   - **Authentication**: Inbound requests must supply a valid `x-integration-signature` header containing a timestamp `t=` and signature `v1=` verified via RSA-SHA256 (in production) or HMAC-SHA256 (in development).
   - **Timestamp / Skew Protection**: Requests skewed by more than 300 seconds are rejected with HTTP 401.
   - **Durable Persistence**: Valid events are durably recorded in `db.webhookEvent` with `provider: "admin_portal"`, `status: "accepted"`, and unique `eventId`.
   - **Fail-Closed**: In production mode, if the database is unconfigured or persistence fails, the endpoint returns HTTP 503 (`Durable integration event storage is unavailable.`).
   - **HTTP 202 Acknowledgment**: Returns `{ accepted: true, eventId, processed: false, status: "accepted" }`. If synchronous execution is explicitly requested (`?sync=true` or `AUTO_PROCESS_INTEGRATION_EVENTS=true`), the worker executes immediately and returns `{ accepted: true, eventId, processed: true, status: "completed" }`.

2. **Phase 2: Domain Worker Dispatching (`lib/saas-integration/worker.ts`)**
   - **Handler Registry**: Event types map to typed handlers (`registerPortalEventHandler(eventType, handler)`). Default handlers support:
     - `entitlements.sync`: Synchronizes monotonic entitlement snapshots via `defaultEntitlementManager.applySnapshot()`.
     - `tenant.suspended` / `tenant.restored`: Handles tenant lifecycle updates.
     - `user.deprovisioned`: Marks user records as suspended in `db.user`.
   - **Batch Queue Drainage**: `processPendingPortalEvents(limit)` selects records where `provider = "admin_portal"` and `status = "accepted"`, executes handlers idempotently, and transitions status to `"completed"` with timestamp `processedAt`.
   - **Failure Recovery & Dead-Lettering**: If a handler throws, the event transitions to `status: "failed"` with `lastError` recorded in the event payload. Failed events remain preserved for inspection or replay without crashing downstream systems.

## Consequences

- **Positive**:
  - Ingestion never blocks on slow external systems or complex domain mutations.
  - Events are guaranteed not to be lost on transient network or compute failures.
  - Exactly-once side effects are enforced via stable `eventId` uniqueness.
  - Developers can register domain handlers without modifying the network ingress route.
- **Negative / Tradeoffs**:
  - Requires database access to durably acknowledge events in production.
  - When asynchronous processing is used, callers must not assume instantaneous side-effect completion without querying status or using the sync query flag.
- **Alternatives Considered**:
  - _Direct in-process execution without persistence_: Rejected because transient container restarts or uncaught errors would permanently drop administrative commands.
  - _External message broker (e.g. SQS/Kafka)_: Deferred. The starter kit avoids mandatory third-party infrastructure dependencies for baseline operation, using the durable PostgreSQL database for queue storage.
