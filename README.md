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

### Template Foundations (Survives into Projects)
- **Universal Operating Laws**: `AI_CONSTITUTION.md` (20 universal engineering laws).
- **Lightweight Navigation Layer**: `AGENTS.md` (<50 lines) synchronized across Claude, Cursor, Windsurf, Gemini, and Antigravity.
- **Permanent Rules**: `.agents/rules/` (engineering, security, product, voice).
- **On-Demand Skills Suite**: `.agents/skills/` (25 specialized on-demand workflows).
- **Personal Defaults Registry**: `.agents/defaults/preferences.yaml` and `docs/design/DESIGN_DEFAULTS.md`.
- **Reusable Assets**: `.agents/defaults/assets/` (adaptive SVG favicon, app icon, social card).
- **Deterministic Documentation Tree**: `docs/` (product, architecture, design, engineering, research, AI).
- **Universal .gitignore Superset**: Comprehensive ignore patterns covering web, mobile, desktop, and native runtimes.
- **Automated Validation**: `.agents/scripts/` (file headers, template validation, context size audit).

### Project-Specific Material (Replaceable / Removable)
- **Default Web Foundation**: Next.js 15 App Router, Tailwind v4, and the 32-component `design-system/`. When initializing a non-web project (CLI, backend, native, extension), this foundation can be cleanly deleted or replaced.
- **Product & Business Assumptions**: `SPEC.md`, `docs/product/PRODUCT_BRIEF.md`, `docs/product/BUSINESS_MODEL.md`.
- **Technical Stack Decisions**: `docs/engineering/TECH_STACK.md`.
- **Project Invariants**: `docs/architecture/INVARIANTS.md`.

---

## 2. Quickstart: Starting a New Project

### Step 1: Create a Repository from this Template
In GitHub:
1. Click **Use this template** -> **Create a new repository**.
2. Clone your new repository locally:
   ```bash
   git clone https://github.com/<your-username>/<your-project-name>.git
   cd <your-project-name>
   ```

*(Manual GitHub Configuration: To enable this repository as a GitHub template, navigate to repository **Settings** -> **General** -> check **Template repository**).*

### Step 2: Initialize the Project

#### Option A: One-Command Initialization (Scripted)
Run the automated bootstrap script:
```bash
# For a Web Application (applies defaults, keeps Next.js foundation)
bun run init-project --name="My App" --type=web

# For a Non-Web Project (CLI, backend, native) with cleanup
bun run init-project --name="FastCli" --type=cli --cleanup
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

## 3. Directory Layout

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
│   ├── skills/               # 25 On-demand specialized workflows
│   │   ├── new-project/      # Repository bootstrap workflow
│   │   ├── project-audit/    # Codebase health inspection (CRITICAL to LOW)
│   │   ├── architecture/     # System topology and boundary design
│   │   ├── backend-design/   # Layered services, transactions, worker patterns
│   │   ├── api-design/       # Schema validation, error envelopes, pagination
│   │   ├── database-design/  # Relational constraints, indexing, safe migrations
│   │   ├── data-modeling/    # Tenancy, soft delete, audit tables, archival
│   │   ├── frontend-design/  # Near-black canvas, hairline borders, density
│   │   ├── ui-ux/            # 5-state lifecycle (idle, loading, success, error, empty)
│   │   ├── accessibility/    # Keyboard navigation, focus rings, WCAG
│   │   ├── visual-qa/        # Layout inspection, overflow checks
│   │   ├── testing/          # Smallest meaningful tests, boundary conditions
│   │   ├── eval-driven-development/ # Executable Evals for user journeys
│   │   ├── debugging/        # Root-cause diagnostic protocol
│   │   ├── security-review/  # Tenant isolation, OWASP ASVS checks
│   │   ├── performance-review/# Profiling, N+1 query elimination
│   │   ├── browser-testing/  # Automated browser navigation and screenshots
│   │   ├── dependency-review/# Package evaluation, bundle impact checks
│   │   ├── migration/        # Non-destructive schema and state transitions
│   │   ├── documentation/    # Anti-drift documentation sync
│   │   ├── adr/              # Architectural Decision Record lifecycle
│   │   ├── release/          # Versioning, changelog, deployment gates
│   │   └── git-workflow/     # Atomic commits, verification before commit
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

## 4. Personal Defaults vs Universal Rules

| Concept | Location | Scope |
| :--- | :--- | :--- |
| **Universal Rules** | `AI_CONSTITUTION.md`, `.agents/rules/` | Non-negotiable for all projects (modularity, security, type safety, verification, truthfulness). |
| **Personal Defaults** | `.agents/defaults/`, `docs/design/DESIGN_DEFAULTS.md` | Recommended preferences (fonts, icons, favicon, near-black canvas, Bun, Vitest). Easy to customize or override. |
| **Project Decisions** | `SPEC.md`, `docs/engineering/TECH_STACK.md` | Decided per project (product name, target user, specific database, auth provider, deployment host). |

---

## 5. Verification Commands

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
