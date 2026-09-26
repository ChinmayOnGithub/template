# New Project Initialization Protocol (new-project.md)

Use this prompt when starting a new project repository from this template.
The goal is to take the project from raw idea to implementation-ready state with minimal questions and zero repetitive setup friction.

---

## 1. Operating Instructions for the AI Agent

1. **Infer Sensible Defaults**: Do not ask 50 questions upfront. Infer reasonable defaults based on the user's idea and `.agents/defaults/preferences.yaml`.
2. **Ask Only What Matters**: Ask questions only when the answer materially affects architecture, technology choice, security, cost, or core user experience.
3. **Clean Up Template Material**: Actively remove or replace template files and dependencies that are irrelevant to the chosen project category.
4. **No Promotional Language**: Maintain a direct, professional, factual tone. No emojis. No em dashes.

---

## 2. Step-by-Step Initialization Sequence

### Step 1: Project Identity and Category Classification
Determine the project fundamentals:
- **Project Name & Description**: One-line purpose.
- **Problem & Target User**: Who experiences this pain, and what is the primary use case?
- **Project Category**: Classify into one of:
  - `web` (Next.js, React, SaaS, dashboard)
  - `browser-extension` (Chrome, Firefox, MV3)
  - `developer-extension` (VS Code extension, IDE plugin)
  - `mobile` (React Native, Flutter)
  - `backend` (Node.js API, microservice, Spring Boot)
  - `native` (C++, Rust systems or CLI utility)
  - `other` (Automation script, library, experiment)

### Step 2: Product and Business Foundation
Populate the product documentation files:
- Fill `SPEC.md` with product summary, capabilities, scope boundaries, and acceptance criteria.
- Fill `docs/product/PRODUCT_BRIEF.md` (user, problem, unique angle).
- Fill `docs/product/GOALS.md` (P0/P1/P2 priorities and measurable objectives).
- Fill `docs/product/BUSINESS_MODEL.md` (value creation, monetization model if applicable, unit economics).
- Fill `docs/product/USER_STORIES.md` and `docs/product/SUCCESS_METRICS.md`.

### Step 3: Technology Selection and Stack Definition
Evaluate project constraints and choose technologies:
- Record choices and rationale in `docs/engineering/TECH_STACK.md` (language, runtime, framework, database, ORM, auth, testing, deployment).
- Update `.env.example` with project-specific environment variables.

### Step 4: Template Cleanup (Crucial)
Do not leave unused template scaffolding in the project:
- If project is **NOT a web application**:
  - Remove `design-system/` if not needed.
  - Remove Next.js / React configuration files (`eslint.config.mjs`, `next.config.ts`, etc.) if using another stack.
  - Update `package.json` to remove web dependencies, or replace with language manifest (`Cargo.toml`, `CMakeLists.txt`, `pom.xml`, `go.mod`).
- If project is a **Web application**:
  - Retain `design-system/` and Next.js / Tailwind setup.
  - Apply personal design defaults from `.agents/defaults/preferences.yaml`.

### Step 5: Architecture and System Invariants
- Establish system boundaries in `docs/architecture/ARCHITECTURE.md`.
- Define system-wide non-negotiable rules in `docs/architecture/INVARIANTS.md`.
- Initialize `docs/architecture/DECISIONS.md` with initial technology ADRs if significant tradeoffs exist.

### Step 6: Design Direction (For Projects with UI)
- Check `.agents/defaults/preferences.yaml` and `docs/design/DESIGN_DEFAULTS.md`.
- Copy or link default assets (`favicon.svg`, `app-icon.svg`) from `.agents/defaults/assets/`.
- Complete `docs/design/DESIGN_BRIEF.md` with visual direction, typography, and interaction states.

### Step 7: Testing and Evals Harness
- Establish testing strategy in `docs/engineering/TESTING.md`.
- Create initial smoke tests or behavioral evaluations in `tests/evals/`.
- Configure unit and browser test runners appropriate to the stack.

### Step 8: Project-Specific README Generation
- Replace the template README with a clean, project-specific `README.md` containing:
  - Project summary & problem solved
  - Architecture and tech stack
  - Prerequisites and setup commands
  - Environment variables
  - Verification commands (lint, test, build)
  - Project structure overview

### Step 9: Verification Gate
Run and verify baseline commands:
```bash
bun run check-headers
bun run typecheck
bun run lint
bun run test
bun run build
```
Confirm all checks pass before declaring initialization complete.

---

## 3. Transition to Implementation
Once the verification gate passes, report the established baseline and proceed directly to feature planning via `.agents/prompts/plan-feature.md` or begin coding.
