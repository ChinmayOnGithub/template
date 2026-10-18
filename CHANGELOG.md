# Changelog

All notable changes to the Universal AI Project Template will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [2.0.0] - 2026-10-18

### Added

- Three-Layer Architecture: Layer A (Universal Foundation), Layer B (Project-Type Profiles), and Layer C (Opt-in Capabilities).
- Capability matrix supporting database, auth, billing, jobs, observability, analytics, storage, and email.
- Project initialization engine in `.agents/scripts/init-project.mjs` supporting `--name`, `--type`, `--profile`, `--capabilities`, `--all-capabilities`, `--dry-run`, and `--cleanup`.
- Capability dependency resolution (billing automatically resolves database and auth).
- Next.js 15 App Router production foundation with React 19, strict TypeScript configuration, and Tailwind CSS v4.
- API foundation (`lib/api/`): Standardized `AppError` hierarchy, `apiSuccess` / `apiError` response envelopes, typed `createApiHandler` wrapper, sliding window rate limiter, and idempotency protection.
- Database capability (`lib/db/` and `prisma/schema.prisma`): Connection pooling safeguard, comprehensive schema (User, Session, Subscription, AuditLog, WebhookEvent, IdempotencyRecord), and seed workflow.
- Authentication & Authorization capability (`lib/auth/`): HMAC-SHA256 session management, role-based access control (RBAC), fine-grained permissions, resource ownership verification, and security audit logger.
- Billing & Webhook capability (`lib/billing/` and `app/api/webhooks/billing/route.ts`): Reusable plan tiers, feature limits, entitlement evaluation, signature-verified webhook handler with replay deduplication, and Razorpay reference adapter.
- Background Jobs capability (`lib/jobs/`): Durable runner interface with retryable vs permanent error classification, exponential backoff, and idempotent task tracking.
- Observability capability (`lib/observability/`): Structured JSON logging with credential/token redaction, trace correlation IDs, and dynamic `/api/health` and `/api/ready` endpoints.
- Pluggable Adapters: Provider-neutral product analytics (`lib/analytics/`), object storage signed URL authorization (`lib/storage/`), and transactional email delivery (`lib/email/`).
- SaaS Integration Layer (`lib/saas-integration/`): Stable versioned contract (`v2026-10-01`), Zod validation schemas, product manifest definition, resilient server-side client with bounded retries, HMAC-SHA256 signature verification with replay protection, monotonic entitlement synchronization cache with outage grace period, and in-memory `MockAdminPortal` test harness.
- Integration Endpoints (`app/api/integration/v1/`): Manifest, health, capabilities, and signed inbound event endpoints.
- Design System Layouts: Reusable starter layouts in `design-system/layouts/` (`AppShell`, `SettingsLayout`, `DataTable`).
- Minimal Dashboard UI: Clean, responsive landing dashboard on `app/page.tsx` showing active foundation capabilities and integration endpoints.
- Genesis Design System & Theme Engine: Light and dark mode support with persistent ThemeToggle, refined typography with General Sans, DM Sans, and JetBrains Mono, and gallery-frame surface ladder.
- Interactive Diagnostics & Showcase UI: Live subsystem verification dashboard, executive KPI overview cards, MRR trend visualization, and component specimen matrix on home and dashboard routes.
- Unit and integration test suites: 111 Vitest tests across 16 suites covering all capabilities, security rules, profile fixtures, and SaaS integration contracts.
- End-to-end browser smoke test: Isolated Playwright suite in `tests/e2e/smoke.spec.ts` executing on dedicated port 3005.
- Research artifact: `docs/research/TEMPLATE_AUDIT.md` classifying all template systems and findings.

### Changed

- Overhauled `.agents/scripts/validate-template.mjs` to validate skill router synchronization and critical system files.
- Synchronized all 46 skills across `AGENTS.md`, `GEMINI.md`, `.agents/AGENTS.md`, `.cursorrules`, and `.windsurfrules`.
- Refactored `design-system/components/Modal.tsx` to compose accessible Radix UI dialog primitives.
- Purged product-specific variables and data attributes from design system primitives.
- Pinned Bun runtime to `1.3.14` across GitHub Actions workflows.
- Removed masked failures (`continue-on-error: true`) from CI formatting, Playwright browser runs, and dependency security audits.

### Fixed

- Resolved 104 file Prettier formatting discrepancies.
- Mitigated critical security vulnerabilities via package overrides for `tinypool`, `source-map-js`, `postcss-selector-parser`, and `postcss`.
- Fixed Next.js build-time database connection failures by enforcing dynamic route execution on API handlers.
- Resolved port collisions and missing browser binaries in Playwright end-to-end testing.
