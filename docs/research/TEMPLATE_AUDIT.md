# Universal AI Project Template: Baseline Engineering Audit

Date: 2026-10-18
Branch: feat/saas-foundation
Auditor: Antigravity Assistant

## Executive Summary

This audit assesses the repository state prior to engineering upgrades. The objective is to convert this universal AI-first template into a reliable, reusable SaaS engineering foundation without converting it into an unwieldy, coupled framework.

Every finding below is grounded in direct test and command execution across runtime, scripts, documentation, and configuration.

---

## 1. Baseline Verification Results

| Check / Script     | Command                         | Exit Code | Result Summary                                              | Root Cause / Note                                                          |
| ------------------ | ------------------------------- | --------- | ----------------------------------------------------------- | -------------------------------------------------------------------------- |
| Runtime Check      | `bun --version; node --version` | 0         | Bun 1.3.14, Node v24.17.0                                   | Verified available on host environment.                                    |
| Template Integrity | `npm run validate-template`     | 0         | Passed (skills, project types, docs, secrets)               | Core structural validators pass.                                           |
| Source Headers     | `npm run check-headers`         | 0         | Passed (46 source files checked)                            | Enforces 3-line comment header rule without emojis or em dashes.           |
| Context Audit      | `npm run audit-context`         | 0         | Passed (46 skills, 9 prompts)                               | Progressive loading inventory verified.                                    |
| Context Index      | `npm run context:index`         | 0         | Passed (318 files, 822 items indexed)                       | AST indexing is functional.                                                |
| Unit / Eval Tests  | `npm run test` (vitest)         | 0         | 3 test files, 9 tests passed                                | Tests pass, but suite is trivial (9 basic asserts).                        |
| Linting            | `npm run lint` (eslint)         | 0         | Passed                                                      | Flat ESLint config with Next.js rules passes.                              |
| TypeScript         | `npm run typecheck` (tsc)       | 0         | Passed                                                      | Zero compiler diagnostic errors in current code.                           |
| Production Build   | `npm run build` (next)          | 0         | Passed                                                      | Basic Next.js landing page compiles cleanly.                               |
| Format Check       | `npm run format:check`          | 1         | FAILED (104 files unformatted)                              | Prettier formatting drift across docs, configs, and components.            |
| E2E Tests          | `npm run test:e2e` (playwright) | 1         | FAILED (Crash on Vitest import, No tests)                   | Missing `playwright.config.ts`; Playwright scans Vitest files and crashes. |
| Dependency Audit   | `bun audit`                     | 1         | FAILED (14 vulnerabilities: 2 critical, 5 high, 7 moderate) | Outdated packages in lockfile (tinypool, postcss, sharp, next, braces).    |

---

## 2. Classification of Findings

### Category 1: Working and Worth Retaining

1. **Context Indexing and Retrieval Core**:
   `.agents/scripts/context-index.mjs` and `context-build.mjs` provide deterministic keyword and symbol extraction, token budgeting, and bounded context loading.
2. **File Header Validation**:
   `.agents/scripts/check-headers.mjs` reliably enforces Law 17 across all `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs` files without false positives on ignored directories.
3. **Template Structural Validation**:
   `.agents/scripts/validate-template.mjs` validates skill YAML frontmatter, project-type guides, core docs presence, internal markdown links, and committed secret patterns.
4. **Agent Skill Suite**:
   46 on-demand skills with detailed execution guides and an external provenance registry in `docs/AI/EXTERNAL_SKILLS.md` and `skills-lock.json`.
5. **Next.js + Tailwind CSS v4 Foundation**:
   Modern stack with React 19, Next.js 15 App Router, and Tailwind CSS v4 running without Tailwind configuration files.
6. **Core Design System Primitives**:
   Components built on `@radix-ui` primitives (`Dialog.tsx`, `Sheet.tsx`, `Popover.tsx`, `DropdownMenu.tsx`, `Tooltip.tsx`, `Switch.tsx`) provide accessible foundations.
7. **Personal Defaults Registry**:
   `.agents/defaults/preferences.yaml` cleanly records UI, typography, tooling, and communication preferences.

### Category 2: Present but Incomplete or Unreliable

1. **Project Initialization Script (`.agents/scripts/init-project.mjs`)**:
   - Only accepts `--name=`, `--type=`, `--cleanup`, `--no-defaults`.
   - Lacks support for `--profile=` (such as `saas` vs `minimal`), `--capabilities=` (such as `auth`, `database`, `billing`), and `--dry-run`.
   - Does not validate arguments before file mutations. Unknown options are silently ignored.
   - For non-web projects, `--cleanup` deletes `design-system/` and some package entries, but leaves `app/`, `next-env.d.ts`, Next.js build scripts, and Next.js eslint configs intact, producing an unbuildable project.
   - Does not refresh or verify `bun.lock` after removing dependencies, causing lockfile drift.
2. **Browser Testing Setup (`test:e2e`)**:
   - `package.json` contains `"test:e2e": "playwright test"`, but there is no `playwright.config.ts`.
   - Playwright defaults to searching for `*.test.ts` anywhere in the repository, matching Vitest eval files under `tests/evals/`, attempting to load them via CommonJS require(), and crashing.
3. **Evaluation Test Suite (`tests/evals/`)**:
   - `sample-invariants.eval.test.ts` and `sample-auth.eval.test.ts` only assert hardcoded JavaScript object literals without testing any actual system invariants, session verification, or isolation boundaries.
4. **Design System Consistency and Token Leakage**:
   - Components contain product-specific references (`Tracker OS`, `data-tracker-control`, `data-tracker-size`).
   - Token naming mixes kebab-case variables (`--primary`, `--surface`) with legacy prefixed variables (`--color-bg-surface`, `--color-border`), and product-specific domain colors (`--color-overdue`, `--color-personal`).
   - `Modal.tsx` is an incomplete hand-rolled modal overlay with basic escape handling, lacking focus trapping, accessibility attributes, and portal mounting, duplicating `@radix-ui/react-dialog`-backed `Dialog.tsx`.
5. **Agent Instruction References and Router Drift**:
   - `AGENTS.md` Task Skill Router lists only 26 skills, leaving 20 existing skills unrouted.
   - `.cursorrules` references non-existent skills (`frontend-design`, `eval-driven-development`, `debugging`).
6. **Codebase Code Style**:
   - 104 files fail `prettier --check .` because formatting was never enforced in pre-commit or CI.

### Category 3: Missing and Worth Implementing

1. **SaaS Application Architecture Layer**:
   - No route handlers or server action standards.
   - No structured API response envelope (`{ success, data, error, meta }`).
   - No standard API error hierarchy or domain error types.
   - No correlation ID / request ID middleware.
   - No rate limiting or idempotency key patterns.
2. **Database Capability**:
   - No Prisma schema, client singleton, migration workflow, or seed scripts for PostgreSQL.
   - No transaction boundary helper or soft-deletion filtering utilities.
3. **Authentication and Authorization Capability**:
   - No session validation, protected route helpers, or server-side user context.
   - No role-based access control (RBAC) or resource ownership checks.
4. **Billing, Entitlements, and Webhook Processing**:
   - No product plan domain model, entitlement checking, or feature limits.
   - No provider-neutral billing interface.
   - No webhook signature verification, replay prevention, event deduplication, or idempotency tracking.
5. **Operational Health and Observability**:
   - No liveness or readiness endpoints (`/api/health`, `/api/ready`).
   - No structured logger with log levels, request correlation, and secret redaction.
6. **Background Jobs Interface**:
   - No durable job adapter pattern, retry classification (transient vs permanent), or idempotency contract.
7. **Email and Object Storage Adapters**:
   - No provider-neutral upload authorization or email delivery abstraction.
8. **Reusable SaaS UI Layouts**:
   - No application shell layout, settings page, data table, or auth page starters.

### Category 4: Unnecessary Duplication or Complexity

1. **Modal vs Dialog Duplication**:
   `Modal.tsx` and `Dialog.tsx` serve identical use cases, but `Dialog.tsx` uses `@radix-ui/react-dialog` while `Modal.tsx` hand-rolls overlay logic with fewer accessibility guarantees.
2. **Double Agent Routing Rules**:
   `AGENTS.md` and `GEMINI.md` are identical duplicates in the root, and `.agents/AGENTS.md` is a third identical duplicate. Maintaining three identical files manually invites drift unless automated or reconciled.
3. **Fragmented CI Formatting Step**:
   `.github/workflows/ci.yml` uses complex bash diff and pipe logic (`git diff-tree ... | xargs -0 -r bunx prettier --check`) with `continue-on-error: true` instead of running `npm run format:check` reliably.

### Category 5: Potentially Dangerous or Destructive Behavior

1. **Silently Masked CI Security Failures**:
   `.github/workflows/security.yml` runs `bun audit` with `continue-on-error: true`. Critical vulnerabilities (such as Prototype Pollution in tinypool) pass CI unnoticed.
2. **Silently Masked CI Test Failures**:
   `.github/workflows/ci.yml` runs Playwright browser tests with `continue-on-error: true`. The broken Playwright setup was completely masked by this flag.
3. **Unvalidated In-Place File Deletions**:
   `.agents/scripts/init-project.mjs` modifies repository files immediately upon invocation without validating inputs, offering no dry-run preview, and leaving partial deletions if an error occurs.
4. **Unpinned CI Runtime Versions**:
   Both CI workflows specify `bun-version: latest`, introducing non-deterministic CI builds when new minor or major runtime releases occur upstream.

### Category 6: Needs a Verified Technology or Provider Decision

1. **Authentication Provider Default**:
   Evaluating self-hosted vs managed authentication. A provider-agnostic session contract with an adapter pattern (e.g. Auth.js / Lucia session semantics or Supabase / Clerk adapter boundary) is necessary so individual products are not vendor-locked.
2. **Database ORM**:
   Prisma is the established convention in documentation. Prisma 6 / Prisma with PostgreSQL is the standard choice for Next.js App Router applications, keeping connection pooling clean during serverless or containerized execution.
3. **Payment Provider**:
   A provider-neutral billing interface with an optional Razorpay reference adapter allows Indian and global payment support without hardcoding Razorpay credentials into core business logic.
4. **Background Jobs Provider**:
   A durable execution contract (with reference to Inngest / Trigger.dev or simple database-backed queues) must keep business dispatch separate from provider SDKs.

---

## 3. Root Cause Analysis

The current limitations stem from three primary root causes:

1. **Template Drift Between Documentation and Implementation**:
   The repository contains comprehensive documentation (`docs/engineering/`, `docs/architecture/`, `docs/design/`), but actual code files (`app/`, `lib/`, `tests/`) were left as bare stubs. Features mentioned in documentation were not yet implemented in code.
2. **Monolithic Web Bias in Repository Bootstrapping**:
   The repository was originally configured exclusively as a Next.js web application. The initialization script attempted naive string-based package.json deletions without full project scaffolding or clean profile isolation.
3. **CI Tolerance for Failure**:
   The presence of `continue-on-error: true` in CI formatting, browser testing, and security scanning allowed regressions (104 unformatted files, broken Playwright test command, 14 security vulnerabilities) to accumulate without failing pull requests.

---

## 4. Implementation Priorities

Based on this audit, work will proceed across the following phases:

1. **Phase 1: Foundation and Repository Hygiene**:
   - Pin CI runtimes and eliminate unjustified `continue-on-error: true`.
   - Configure `playwright.config.ts` with correct test directory scoping.
   - Run Prettier to resolve the 104 file formatting errors.
   - Remediate lockfile vulnerabilities via targeted dependency updates.
   - Harmonize agent instructions (`AGENTS.md`, `.cursorrules`, skill router).
2. **Phase 2: Project Profile and Capability System**:
   - Refactor `.agents/scripts/init-project.mjs` to support validated profiles (`web/saas`, `web/minimal`, `backend/node`, `cli`, etc.), opt-in capabilities (`auth`, `database`, `billing`, `jobs`, `observability`, `storage`, `email`, `analytics`), dry-run mode, and atomic rollback.
   - Add unit and fixture tests for initialization and validation.
3. **Phase 3: SaaS Web Foundation**:
   - Establish clean layered architecture in Next.js App Router.
   - Implement API foundation: typed response envelope, error hierarchy, correlation IDs, input validation schemas, rate limiting.
   - Clean up design system tokens, remove Tracker-specific attributes, replace redundant `Modal.tsx` with accessible `Dialog` composition.
   - Add responsive application layouts (AppShell, PageHeader, Settings, Empty, Error).
4. **Phase 4: High-Value Optional SaaS Capabilities**:
   - Prisma + PostgreSQL setup with connection management, migrations, and seed scripts.
   - Authentication foundation with session verification, RBAC, and ownership checks.
   - Billing and entitlements engine with plan definitions, usage limits, signature-verified webhook processing, and idempotency tracking.
   - Background job interface with retry classification and execution contract.
   - Observability endpoints (`/api/health`, `/api/ready`) and structured logger.
5. **Phase 5: Multi-Profile Fixture Validation**:
   - Test initialization across `web/saas`, `web/minimal`, `backend/node`, and `cli` in temporary directories.
   - Verify that generated projects contain only relevant files, pass typecheck, and build cleanly.
6. **Phase 6: Release Readiness**:
   - Run full verification suite across all layers.
   - Update documentation and changelog.
