# Starter Kit Audit and Framework Strategy (STARTER_AUDIT.md)

This document provides a concise audit of the template repository, architecture choices, framework selections, and implementation roadmap for turning the template into a reusable, framework-first SaaS starter pack.

---

## 1. Baseline Framework and Environment Audit

| Domain             | Technology / Selection                   | Status / Compatibility                                    |
| :----------------- | :--------------------------------------- | :-------------------------------------------------------- |
| **Framework**      | Next.js 15.5.28 (App Router)             | Active, React 19 compatible, strict TypeScript            |
| **Runtime & PM**   | Bun (1.3.14 / 1.4.3)                     | Active, lockfile consistent                               |
| **Styling**        | Tailwind CSS v4 (`@tailwindcss/postcss`) | CSS-first configuration, zero runtime overhead            |
| **UI Primitives**  | Radix UI + Design System Primitives      | Fully accessible, keyboard and screen-reader compliant    |
| **Icons**          | Lucide React                             | Installed, consistent icon set                            |
| **Authentication** | `better-auth` v1.7.10                    | Framework-first, official Next.js integration             |
| **Validation**     | Zod v3.25.76                             | Runtime type inference and boundary guards                |
| **Database & ORM** | PostgreSQL + Prisma schema               | Relational baseline established in `prisma/schema.prisma` |
| **Testing**        | Vitest + Playwright                      | 82 unit/integration tests + isolated E2E suite            |

---

## 2. Existing vs. Missing Capabilities

### Existing and Retained

- Universal AI guidance (`AI_CONSTITUTION.md`, `AGENTS.md`, 46 skills).
- Reusable API foundations (`lib/api/`): `AppError`, response envelopes, sliding window rate limiter, idempotency keys.
- Central SaaS Admin Portal integration (`lib/saas-integration/`): v2026-10-01 contract, signature authentication, monotonic entitlement cache, resilient client, mock portal.
- Pluggable adapters (`lib/billing/`, `lib/email/`, `lib/jobs/`, `lib/observability/`, `lib/storage/`, `lib/analytics/`).
- Accessible UI components in `design-system/components/` and starter layouts in `design-system/layouts/`.

### Gaps to Implement (Framework-First)

1. **Authentication**: Configure `better-auth` server and client, mount official Next.js catch-all route at `/api/auth/[...all]`, connect database adapter, configure password authentication, and add starter UI pages.
2. **SEO Infrastructure**: Native Next.js metadata helpers, `robots.ts`, dynamic `sitemap.ts`, and structured data (JSON-LD) components.
3. **Cookie Consent & Privacy**: Configurable banner, preferences modal, consent persistence, and legal pages (`/privacy`, `/terms`, `/cookies`).
4. **Starter Scaffolding**: Auth screens (`/login`, `/signup`, `/forgot-password`, `/reset-password`), dashboard, profile, and settings.

---

## 3. Implementation Plan

- **Phase 1**: Configure Better Auth server instance in `lib/auth/better-auth.ts`, client in `lib/auth/auth-client.ts`, and route handler in `app/api/auth/[...all]/route.ts`.
- **Phase 2**: Align `prisma/schema.prisma` with Better Auth's official models (`User`, `Session`, `Account`, `Verification`).
- **Phase 3**: Create clean, accessible authentication and settings pages using existing design system tokens and Radix UI primitives.
- **Phase 4**: Implement Next.js native SEO (`app/robots.ts`, `app/sitemap.ts`, `lib/seo/config.ts`, `lib/seo/json-ld.tsx`).
- **Phase 5**: Implement cookie consent system (`lib/consent/`, `design-system/components/CookieBanner.tsx`, `CookiePreferencesDialog.tsx`) and legal page templates.
- **Phase 6**: Update documentation and verification gates.
