# ADR-003: Feature-Oriented Modular Monolith Directory Structure and Dependency Boundaries

## Status

Accepted

## Context

As the SaaS template grows to support multiple downstream products (such as Tracker, Namer, Stremora, Booker), organizing code strictly by technical role (e.g., throwing all backend logic into a monolithic `lib/` directory and components into generic buckets) leads to tight coupling, discoverability issues, and unclear module boundaries.
To ensure maintainability and scalability, the codebase requires a feature-oriented, modular monolith architecture where modules are grouped by business capability first, with clear dependency directions and explicit public entry points.

## Decision

We organize the application into distinct architectural layers with strict dependency rules:

```text
template/
├── app/                        # Application Layer: Next.js routes, layouts, and thin route handlers
├── features/                   # Business Capabilities
│   ├── auth/                   # Authentication, RBAC, sessions, audit logging, auth client
│   ├── billing/                # Subscription plans, limits, lifecycle, webhooks, Razorpay provider
│   └── integrations/           # Admin Portal client, contracts, entitlements, worker
├── server/                     # Shared Infrastructure & Backend Adapters
│   ├── db/                     # Prisma client singleton, connection health probing, seed
│   ├── email/                  # Transactional email providers (Resend, mock)
│   ├── storage/                # Object storage adapter (presigned URLs, validation)
│   └── jobs/                   # Background job runner, queue contracts
├── lib/                        # Foundation & Cross-Cutting Pure Utilities
│   ├── api/                    # JSON envelopes, error taxonomy, rate limiting, idempotency
│   ├── config/                 # Validated environment configuration
│   ├── observability/          # Structured JSON logger, telemetry metrics
│   ├── consent/                # Privacy and cookie consent state
│   ├── seo/                    # Metadata constructors, JSON-LD schemas
│   └── utils.ts                # Class-variance / tailwind class merger (cn)
├── design-system/              # Reusable UI primitives and design tokens
└── tests/                      # Unit, integration, e2e, and architecture tests
```

### Dependency Rules

1. **Inward Dependencies Only**:
   - `app/` routes may import from `features/`, `server/`, `lib/`, and `design-system/`. Route files must remain thin controllers and delegate business logic to feature services.
   - `features/` may import from `server/`, `lib/`, and `design-system/`. Cross-feature imports must use the target feature's deliberate public entry point (`index.ts`). Features must never import from `app/`.
   - `server/` (infrastructure adapters) may import from `lib/`. Infrastructure must never import from `app/`, `features/`, or `design-system/`.
   - `lib/` (foundation) contains pure utilities and must never import from `app/`, `features/`, `server/`, or `design-system/`.
   - `design-system/` contains presentation primitives and must never import server-side code, database models, or route handlers.

2. **Server/Client Boundary Separation**:
   - Secrets, database queries, and administrative tokens remain confined to server-only code.
   - Browser client code imports from client-safe entry points (e.g., `@/features/auth/auth-client`).

3. **Naming Standards**:
   - **Directories**: lowercase kebab-case (`saas-integration`, `api-keys`).
   - **React Components**: PascalCase (`Button.tsx`, `PlanCard.tsx`).
   - **General TypeScript Modules**: lowercase kebab-case (`subscription-service.ts`, `worker.ts`).
   - **Functions & Variables**: camelCase (`createSubscription()`, `getCurrentUser()`).
   - **Types & Classes**: PascalCase (`SubscriptionStatus`, `BillingProvider`).
   - **Test Files**: Mirror tested source modules (`billing.test.ts`, `portal-lifecycle.test.ts`).

4. **Backward Compatibility**:
   - Core barrels in `lib/` provide re-exports to ensure zero breakage for existing imports during incremental migrations.

## Consequences

- **Positive**:
  - Predictable file location: developers find capability logic under `features/<name>/`.
  - High cohesion, low coupling: features can be developed or extracted independently.
  - Circular dependencies are prevented by explicit layer hierarchy.
  - Downstream products can safely reuse the template foundation.
- **Negative / Tradeoffs**:
  - Requires maintaining path aliases and discipline in import statements.
  - Adding a new capability requires adhering to the layered model rather than dropping quick helpers into random files.
- **Alternatives Considered**:
  - _Full monorepo (Turborepo/pnpm workspaces)_: Deferred. Introduces unnecessary overhead for early-stage SaaS development before multiple deployable packages exist.
  - _Generic technical folders (`services/`, `controllers/`, `models/`)_: Rejected because spreading a single business feature across 4 remote directories impairs developer navigation and cohesion.
