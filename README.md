# Personal Universal AI Project Template

A universal, AI-first software project bootstrap template with strong personal defaults and an automated project initialization workflow.

This repository serves as a seed for bootstrapping new software projects (web apps, SaaS, APIs, CLI utilities, browser extensions, mobile apps, native C++/Rust tools). It eliminates repetitive decisions around engineering standards, documentation structure, tooling conventions, design defaults, testing, security, and AI workflow.

---

## 1. Core Architecture and Mental Model

```text
                    UNIVERSAL TEMPLATE
                           |
                           v
                  PROJECT INITIALIZATION
                           |
             +-------------+-------------+
             |                           |
       KEEP UNIVERSAL               SPECIALIZE
       FOUNDATIONS                  THE PROJECT
             |                           |
             |                    delete irrelevant files
             |                    replace stack-specific files
             |                    install dependencies
             |                    choose project type
             |                    configure tooling
             |                    configure deployment
             |                    configure design
             |
             +-------------+-------------+
                           v
                    READY TO PLAN
                           |
                           v
                SPEC -> ARCHITECTURE -> PLAN
                           |
                           v
                     READY TO CODE
```

### Three-Layer Architecture

1. **Layer A: Universal Foundation**
   Every initialized project retains only the pieces it genuinely needs:
   - Universal operating laws (`AI_CONSTITUTION.md`) and synchronized lightweight agent maps (`AGENTS.md`)
   - 46 specialized on-demand agent skills in `.agents/skills/`
   - Git and repository hygiene, universal `.gitignore` superset, and strict file headers
   - Deterministic documentation tree in `docs/`
   - Automated quality gates (file headers, template self-validation, context efficiency audit)

2. **Layer B: Project-Type Profiles**
   Specialized starting points tailored by language and target runtime:
   - `web/saas`: Next.js 15 App Router, React 19, Tailwind CSS v4, accessible design system primitives
   - `web/minimal`: Lightweight static or client-rendered web application without database or billing
   - `backend/node`: Node.js / TypeScript API service
   - `cli/node`: Automation scripts and command-line interfaces
   - `browser-extension`: Chrome / Firefox Manifest V3 extensions
   - `developer-extension`: VS Code and developer tooling extensions
   - `mobile`: React Native or Flutter mobile applications
   - `native`: Rust or C++ native systems applications

3. **Layer C: Opt-In Reusable Capabilities**
   Independently activatable modules with typed contracts, error boundaries, and tests:
   - `database`: PostgreSQL connection pool protection and Prisma schema / seed scripts (`lib/db/`)
   - `auth`: Cryptographic session tokens, RBAC permissions, and ownership checks (`lib/auth/`)
   - `billing`: Product plans, entitlements, limits, and signature-verified webhook handler (`lib/billing/`)
   - `jobs`: Background runner with exponential backoff and idempotency protection (`lib/jobs/`)
   - `observability`: Structured JSON logging with credential redaction, `/api/health`, `/api/ready` (`lib/observability/`)
   - `analytics`: Provider-neutral product analytics adapter with privacy consent flags (`lib/analytics/`)
   - `storage`: Upload authorization and signed URL generation adapter (`lib/storage/`)
   - `email`: Transactional email delivery adapter with mock and live transports (`lib/email/`)
   - `integration`: SaaS Admin Portal integration layer, handshake, and entitlements (`lib/saas-integration/`)

---

## 2. Capability Matrix

| Capability                           | Universal Core    | SaaS Web Profile | Optional Module       |
| :----------------------------------- | :---------------- | :--------------- | :-------------------- |
| **Project Specification & AI Rules** | Yes               | Yes              | No                    |
| **TypeScript & Verification Gates**  | Profile-dependent | Yes              | No                    |
| **Design System & Starter Layouts**  | No                | Yes              | No                    |
| **PostgreSQL & Prisma ORM**          | No                | Optional         | Yes (`database`)      |
| **Authentication & RBAC**            | No                | Optional         | Yes (`auth`)          |
| **Billing & Entitlements**           | No                | Optional         | Yes (`billing`)       |
| **Background Jobs & Retries**        | No                | Optional         | Yes (`jobs`)          |
| **Observability & Health Checks**    | Profile-dependent | Yes              | Yes (`observability`) |
| **Product Analytics**                | No                | Optional         | Yes (`analytics`)     |
| **Object Storage**                   | No                | Optional         | Yes (`storage`)       |
| **Transactional Email**              | No                | Optional         | Yes (`email`)         |
| **SaaS Admin Portal Integration**    | No                | Optional         | Yes (`integration`)   |

---

## 3. Quickstart: Starting a New Project

### Step 1: Create a Repository from this Template

In GitHub:

1. Click **Use this template** -> **Create a new repository**.
2. Clone your new repository locally:
   ```bash
   git clone https://github.com/<your-username>/<your-project-name>.git
   cd <your-project-name>
   ```

_(Manual GitHub Configuration: To enable this repository as a GitHub template, navigate to repository **Settings** -> **General** -> check **Template repository**)._

### Step 2: Initialize the Project

#### Option A: One-Command Initialization (Scripted)

Run the automated bootstrap script with the desired profile and capabilities:

```bash
# 1. Preview changes before applying (Dry Run)
bun run init-project --dry-run --name="Admin Portal" --type=web --profile=saas

# 2. SaaS Web Application with full capabilities (Admin Portal, Stremora, Tracker)
bun run init-project --name="Admin Portal" --type=web --profile=saas --all-capabilities

# 3. Specific capabilities only (e.g., database and auth)
bun run init-project --name="SaaS MVP" --type=web --profile=saas --capabilities=database,auth

# 4. Lightweight web tool without database (Namer)
bun run init-project --name="Namer" --type=web --profile=minimal

# 5. Node Backend API with cleanup of web scaffolding
bun run init-project --name="Core API" --type=backend --profile=node --capabilities=database,observability --cleanup

# 6. CLI tool with node profile and cleanup
bun run init-project --name="Data Sync" --type=cli --profile=node --cleanup
```

#### Option B: AI-Guided Initialization (Prompt)

Open the repository in your AI coding environment (Antigravity, Cursor, Windsurf, Claude Code) and prompt:

```text
Execute .agents/prompts/new-project.md to initialize this project.
```

The AI agent will:

1. Discover project identity and classify category.
2. Formulate product requirements (`SPEC.md`, `PRODUCT_BRIEF.md`, `GOALS.md`, `BUSINESS_MODEL.md`).
3. Select technology stack and document in `docs/engineering/TECH_STACK.md`.
4. Perform cleanup: remove irrelevant template files if non-web.
5. Apply personal design defaults (`.agents/defaults/preferences.yaml`).
6. Establish architecture topology and invariants.
7. Set up initial tests/evals in `tests/evals/`.
8. Generate project-specific `README.md`.
9. Run verification checks to confirm baseline is green.

---

## 4. Directory Layout

```text
/
├── AGENTS.md                 # Lightweight universal AI navigation map (<50 lines)
├── AI_CONSTITUTION.md        # 20 Non-negotiable universal engineering laws
├── SPEC.md                   # Single source of truth for product scope
├── README.md                 # Template documentation (replaced upon initialization)
├── tsconfig.json             # Strict TypeScript configuration
├── package.json              # Canonical manifest & verification scripts
├── eslint.config.mjs         # Flat ESLint configuration
├── .prettierrc               # Prettier formatting configuration
├── .gitignore                # Universal .gitignore superset
├── .env.example              # Baseline environment configuration
│
├── .agents/
│   ├── defaults/             # Personal reusable defaults
│   │   ├── preferences.yaml  # Configurable personal defaults registry
│   │   ├── design/           # Default design tokens
│   │   └── assets/           # Reusable vector SVG favicon, app icon, social preview
│   │
│   ├── rules/                # Permanent standards (always active)
│   │   ├── engineering.md    # Layer separation, file headers, TypeScript rules, DoD
│   │   ├── product.md        # Product planning before coding, velocity with rigor
│   │   ├── security.md       # Zero-trust, scoped authorization, secret protection
│   │   └── voice.md          # Technical co-founder persona, no emojis, no em dashes
│   │
│   ├── prompts/              # Reusable agent workflows
│   │   ├── new-project.md    # End-to-end bootstrap protocol
│   │   ├── plan-feature.md   # Feature planning and dependency analysis
│   │   ├── research.md       # Technical research and benchmark comparison
│   │   ├── debug.md          # 7-step root-cause debugging protocol
│   │   ├── review.md         # Pre-commit code and invariant review
│   │   ├── audit.md          # Full repository health audit
│   │   ├── security-review.md# Security inspection protocol
│   │   ├── performance-review.md # Latency and query optimization
│   │   └── refactor.md       # Safe refactoring workflow
│   │
│   ├── project-types/        # Category-specific guidance
│   │   ├── web/              # Next.js (App Router, Tailwind v4), React
│   │   ├── browser-extension/# Chrome, Firefox (Manifest V3)
│   │   ├── developer-extension/# VS Code extensions
│   │   ├── mobile/           # React Native, Flutter
│   │   ├── backend/          # Node.js, Spring Boot
│   │   └── native/           # C++, Rust
│   │
│   ├── skills/               # Orchestrated skills portfolio (46 local & community skills)
│   │   ├── Requirements/Spec # grilling, domain-modeling, to-spec, to-tickets
│   │   ├── Project Lifecycle # new-project, project-setup, project-analysis, project-audit, project-memory
│   │   ├── Architecture/Data # system-design-first-principles, backend-design, api-design, database-design, data-modeling
│   │   ├── Quality & Review  # code-review, pr-code-review, simplification, refactoring, repository-cleanup
│   │   ├── Dependencies      # dependency-audit, dependency-upgrade
│   │   ├── Security & Ops    # security-review, threat-model, observability-review, deployment-review, incident-review
│   │   ├── Testing & Debug   # test-driven-development, define-evals, agentic-browser-testing, debugger
│   │   ├── Planning/Context  # planning-with-files, context-engineering, orchestration, retrospective, why-we-do-this
│   │   ├── Git Workflow      # git-workflow
│   │   ├── Frontend & Design # design-systems-frontend-architecture, ui-visual-composition, ux-usability-foundations, ux-writing-content-design, accessibility-inclusive-design, tailwind-css
│   │   └── Web & SEO         # web-quality, seo
│   │   └── (See docs/AI/EXTERNAL_SKILLS.md for full provenance registry & overlap resolutions)
│   │
│   └── scripts/
│       ├── check-headers.js  # Validates 3-line file headers on source files
│       ├── validate-template.js # Template self-validation check
│       ├── audit-context.js  # Context footprint and token efficiency audit
│       └── init-project.js   # Automated project initialization and cleanup
│
├── docs/
│   ├── product/              # PRODUCT_BRIEF, GOALS, BUSINESS_MODEL, USER_STORIES, SUCCESS_METRICS
│   ├── architecture/         # ARCHITECTURE, INVARIANTS, DECISIONS, ADR/
│   ├── design/               # DESIGN_DEFAULTS, DESIGN_BRIEF, DESIGN_SYSTEM, DESIGN_PRINCIPLES, UX_RULES
│   ├── engineering/          # TECH_STACK, DEVELOPMENT, TESTING, SECURITY, PERFORMANCE, ERROR_HANDLING, IDEMPOTENCY, OBSERVABILITY, RELEASE, DEPENDENCIES
│   ├── research/             # RESEARCH.md
│   └── AI/
│       └── AI_WORKFLOW.md    # End-to-end development methodology
│
├── design-system/            # Default web UI foundation (32+ canonical primitives)
│   ├── tokens.css            # Surface ladder, near-black canvas, lavender accent
│   ├── components/           # Button, Card, Dialog, Modal, Input, Sheet, Toast, etc.
│   └── index.ts              # Barrel export
│
├── tests/
│   ├── unit/                 # Fast unit tests
│   ├── integration/          # Multi-layer integration tests
│   ├── e2e/                  # Playwright browser journeys
│   └── evals/                # Executable behavioral evaluations
│
└── .github/workflows/
    ├── ci.yml                # Lint, typecheck, header check, test, build, e2e
    └── security.yml          # Automated dependency audit
```

---

## 5. Personal Defaults vs Universal Rules

| Concept               | Location                                              | Scope                                                                                                           |
| :-------------------- | :---------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Universal Rules**   | `AI_CONSTITUTION.md`, `.agents/rules/`                | Non-negotiable for all projects (modularity, security, type safety, verification, truthfulness).                |
| **Personal Defaults** | `.agents/defaults/`, `docs/design/DESIGN_DEFAULTS.md` | Recommended preferences (fonts, icons, favicon, near-black canvas, Bun, Vitest). Easy to customize or override. |
| **Project Decisions** | `SPEC.md`, `docs/engineering/TECH_STACK.md`           | Decided per project (product name, target user, specific database, auth provider, deployment host).             |

---

## 6. Verification Commands

Run verification commands from the project root:

```bash
# Verify mandatory 3-line file headers across source files
bun run check-headers

# Validate template integrity, skills, and structure
bun run validate-template

# Audit AI context size and token footprint
bun run audit-context

# Check code formatting
bun run format:check

# Run linter
bun run lint

# Run type check
bun run typecheck

# Run unit and integration tests
bun run test

# Run browser tests
bun run test:e2e

# Run production build
bun run build
```
