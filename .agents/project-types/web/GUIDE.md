# Web Project Standards

## 1. Overview
Applies to client-facing web applications, dashboards, marketing sites, and full-stack web platforms.

## 2. Default Stack
- **Framework**: Next.js (App Router) or Vite + React
- **Language**: TypeScript (strict baseline)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss";` with PostCSS plugin)
- **Design System**: Linear-inspired near-black canvas and hairline border tokens (`design-system/`)
- **Formatting**: Prettier with repository configuration
- **Linting**: ESLint with framework rules
- **Testing**: Vitest for unit/integration, Playwright for browser/E2E
- **CI**: GitHub Actions (`.github/workflows/ci.yml`)

## 3. Sub-Framework Guidelines
- See `nextjs/GUIDE.md` for App Router conventions, Server Actions, and bundling rules.
- See `react/GUIDE.md` for client-only state, hooks, and component lifecycle rules.
