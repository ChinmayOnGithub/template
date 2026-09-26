# Technology Stack (TECH_STACK.md)

This document records the technology stack selections for this project, along with the technical justification for each choice.

---

## 1. Core Platform and Tooling

| Component | Selected Technology | Version / Target | Rationale |
| :--- | :--- | :--- | :--- |
| **Language** | TypeScript | 5.8+ | Strong compile-time type safety and ecosystem productivity |
| **Runtime** | Bun (or Node.js 20+ LTS) | Latest stable | Fast startup, built-in bundling, and rapid test execution |
| **Package Manager** | Bun (or pnpm) | Latest | Deterministic lockfile resolution and fast dependency installation |
| **Framework** | Next.js (or project choice) | 15+ App Router | Server Components, fast edge streaming, and unified routing |
| **Styling** | Tailwind CSS | v4 (`@import "tailwindcss"`) | CSS-first configuration and zero runtime styling overhead |

---

## 2. Backend and Data Layer

| Component | Selected Technology | Target Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Database** | PostgreSQL / SQLite / None | Specific target | Relational integrity, ACID compliance, or lightweight local storage |
| **ORM / Query Builder**| Prisma / Drizzle / Raw SQL | Specific target | Type-safe schema definition and migration safety |
| **Authentication** | Auth.js / Supabase / Custom | Specific target | Secure session handling, token validation, and tenant isolation |
| **API Style** | REST / Server Actions / tRPC | Specific target | Typed request-response contracts with schema validation |

---

## 3. Testing and Verification

| Component | Selected Technology | Target Version | Rationale |
| :--- | :--- | :--- | :--- |
| **Unit & Integration** | Vitest (or Bun test) | Latest stable | Fast execution, native ESM/TS support, and zero config |
| **Browser / E2E** | Playwright | Latest stable | Real browser automation, web-first assertions, and trace viewer |
| **Static Analysis** | ESLint + TypeScript | Strict mode | Code quality rules, unused variable checks, and strict null safety |
| **Formatter** | Prettier | Latest stable | Deterministic code formatting across CLI and editors |

---

## 4. Infrastructure, CI/CD, and Observability

| Component | Selected Technology | Target | Rationale |
| :--- | :--- | :--- | :--- |
| **CI Platform** | GitHub Actions | Standard runners | Automated lint, typecheck, header check, test, and build |
| **Hosting Target** | Vercel / Cloudflare / Docker | Production | Edge distribution, zero maintenance infrastructure, or container isolation |
| **Logging** | Structured JSON | Standard output | Machine-readable log lines with trace context |
| **Error Monitoring** | Sentry / OpenTelemetry / None | Production | Unhandled exception alerts and performance tracing |

---

## 5. Technology Tradeoffs and Alternatives Considered

- **Alternative 1**: (e.g. Vite instead of Next.js)  -  Why rejected / when to switch.
- **Alternative 2**: (e.g. Drizzle instead of Prisma)  -  Why rejected / when to switch.
