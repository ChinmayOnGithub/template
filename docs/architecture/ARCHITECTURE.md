# System Architecture

This document outlines the architectural principles and structural topology of this system.

---

## 1. Universal Architecture Principles

These principles apply to all project categories (web, CLI, extensions, mobile, backend, native):

1. **Separation of Concerns**:
   Divide responsibilities cleanly into distinct layers or modules. Never mix presentation rendering, business logic, validation, and data persistence in a single file or component.
2. **Explicit Boundaries**:
   Define strict interfaces, types, schemas, or protocols between system boundaries. Internal implementation changes must not leak across public boundaries.
3. **Dependency Direction**:
   Dependencies must point inward toward the core domain logic. Domain rules must never depend on user interfaces or low-level transport mechanisms.
4. **Single Source of Truth**:
   Every piece of state, preference, or domain entity must have a clear, authoritative owner. No duplicate sources of truth or uncoordinated shadow states.
5. **Deterministic Error Handling**:
   Errors must be classified and handled at appropriate boundaries. Never swallow exceptions or allow unhandled crashes.
6. **Observable Behavior**:
   Important operations, state mutations, and failures must be auditable through structured logs or telemetry without leaking sensitive credentials.

---

## 2. Project-Type Architecture Topologies

Select and customize the topology that matches this project:

### A. Web / SaaS Application Topology

```text
[ Client Viewport / UI ]
        |
        v (Validation schemas, auth session)
[ Controller / Server Action / Route Handler ]
        |
        v (Domain business logic, state machines)
[ Domain Services ]
        |
        v (Parameterized queries, transactions)
[ Database / Storage Engine ]
```

### B. Browser Extension Topology

```text
[ Content Scripts (DOM Ingestion) ]  <--->  [ Extension Popup / UI ]
                     \                 /
                      \ (Message Port) /
                       v              v
            [ Ephemeral Background Service Worker ]
                       |
                       v
            [ Storage: chrome.storage.local / Remote API ]
```

### C. Developer Tool / CLI Topology

```text
[ CLI Input / Arguments Parsing (Commands) ]
        |
        v
[ Application Layer (Command Handlers & Workflows) ]
        |
        v
[ Core Domain Logic & Engine ]
        |
        v
[ System I/O / File System / Process Spawning ]
```

### D. Standalone Backend / API Service

```text
[ API Gateway / HTTP Server (Fastify / Express / Spring) ]
        | (Request validation, auth middleware)
        v
[ Controllers / Handlers ]
        | (Pure domain operations)
        v
[ Domain Use Cases / Services ]
        | (Data abstraction / Repository interfaces)
        v
[ Repositories / External Adapters ]
```

### E. Native Systems / C++ / Rust Topology

```text
[ Platform Entry Point / Driver ]
        |
        v
[ Core Engine / Processing Pipeline ]  (RAII, Memory Bounds, Result/Expected)
        |
        v
[ Platform Hardware / OS Abstractions (POSIX / Win32 / Syscalls) ]
```

---

## 3. Current Project Architecture

This SaaS starter kit implements a **Feature-Oriented Modular Monolith** topology designed to scale cleanly across multiple downstream products while maintaining strict separation of concerns.

### Architectural Layers

```text
[ Application Layer ]
      app/                  (Next.js routes, layouts, thin route handlers)
        |
        v
[ Feature Modules ]
      features/auth/        (Better Auth, RBAC, sessions, audit logging, auth client)
      features/billing/     (Plans, Razorpay provider, webhooks, entitlements)
      features/integrations/(Admin Portal sync, HMAC verification, event worker)
        |
        v
[ Shared Infrastructure ]
      server/db/            (Prisma client singleton, migrations, connection health)
      server/email/         (Resend provider, dev in-memory sink)
      server/storage/       (S3/R2 presigned upload provider)
      server/jobs/          (Background job runner, retry semantics)
        |
        v
[ Foundation & Utilities ]
      lib/api/              (Standard JSON envelopes, error taxonomy, idempotency)
      lib/config/           (Validated environment configuration)
      lib/observability/    (Structured JSON logger, telemetry metrics)
      lib/consent/          (Cookie consent manager)
      lib/seo/              (Metadata generators, JSON-LD schemas)
      lib/utils.ts          (Predictable class merging via cn)
```

### Dependency Rules

1. **Inward Dependencies Only**:
   - `app/` routes delegate business logic to `features/`, `server/`, and `lib/`.
   - `features/` may depend on `server/`, `lib/`, and `design-system/`. Cross-feature communication must pass through public module entry points (`index.ts`).
   - `server/` (infrastructure adapters) may depend only on `lib/` (foundation). Infrastructure never depends on `features/` or `app/`.
   - `lib/` (foundation) contains pure utilities and must never depend on `server/`, `features/`, or `app/`.
   - `design-system/` contains presentation components and must never import server-only logic, database models, or route handlers.

2. **Server and Client Boundaries**:
   - Secrets, database queries, and private HMAC keys are restricted to server-side code.
   - Client components import only from safe client entry points (such as `@/features/auth/auth-client`).

3. **File Naming Standards**:
   - **Directories**: lowercase kebab-case (`saas-integration`, `api-keys`).
   - **React Components**: PascalCase (`Button.tsx`, `PlanCard.tsx`).
   - **General TypeScript Modules**: lowercase kebab-case (`subscription-service.ts`, `worker.ts`).
   - **Functions and Variables**: camelCase (`createSubscription()`, `getCurrentUser()`).
   - **Types and Classes**: PascalCase (`SubscriptionStatus`, `BillingProvider`).
   - **Test Files**: Mirror target module name (`billing.test.ts`, `auth.test.ts`).
