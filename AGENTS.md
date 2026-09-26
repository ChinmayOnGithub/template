# Project Instructions

## Start Here
Before modifying code:
1. Read `SPEC.md` when the task changes product behavior or feature scope.
2. Read `AI_CONSTITUTION.md` when making architectural decisions, data mutations, or structural changes.
3. Check `.agents/rules/` for permanent standards on engineering, security, product, and voice.
4. If initializing or planning a new project, run `.agents/prompts/new-project.md`.
5. If working on a specific project type, consult `.agents/project-types/<category>/`.
6. Route expertise using the Skill Routing Hierarchy:
   - **Generic disciplines** (UI/UX, Tailwind, debugging, testing, architecture, planning, evals): load external Agent Skills from `.agents/skills/<skill-name>/SKILL.md` (see `docs/AI/EXTERNAL_SKILLS.md`).
   - **Personal preferences** (fonts, density, colors, aesthetic): consult `.agents/defaults/preferences.yaml` and `docs/design/DESIGN_DEFAULTS.md`.
   - **Project-specific orchestration & invariants**: consult local skills (`new-project`, `project-audit`, `api-design`, `backend-design`, `data-modeling`, `database-design`) and project specs.
7. Inspect existing implementation patterns before creating new ones.
8. Run the smallest relevant verification after changes.

## Skill Routing Hierarchy
External skills provide methodology; the repository provides truth.
- **Level 1 (Ultimate Truth)**: `SPEC.md`, `AI_CONSTITUTION.md`, `docs/architecture/INVARIANTS.md`.
- **Level 2 (Personal Defaults)**: `.agents/defaults/preferences.yaml`, `docs/design/DESIGN_DEFAULTS.md`.
- **Level 3 (Project Decisions)**: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/ADR/`.
- **Level 4 (Methodology & Workflow)**: `.agents/skills/` (external + local skills). An external skill must never override Level 1-3.

## Task Skill Router
Route on-demand task needs to matching skills in `.agents/skills/<name>/SKILL.md`:
- Unfamiliar repository -> `project-analysis`
- New project setup -> `project-setup`
- Unclear requirements -> `grilling`
- Domain modeling -> `domain-modeling`
- Requirements to spec -> `to-spec`
- Specification to tasks -> `to-tickets`
- Multi-step / persistent task -> `planning-with-files`
- Context boundaries & loading -> `context-engineering`
- Code quality review -> `code-review`
- Pull request review -> `pr-code-review`
- Complexity reduction -> `simplification`
- Structural change -> `refactoring`
- Hygiene & dead code -> `repository-cleanup`
- Dependency security / bloat -> `dependency-audit`
- Dependency upgrade -> `dependency-upgrade`
- Security architecture -> `threat-model`
- Production visibility -> `observability-review`
- Release preparation -> `deployment-review`
- Production incident -> `incident-review`
- Engineering rationale -> `why-we-do-this`
- Evolving context -> `project-memory`
- Git branch & commits -> `git-workflow`
- Web audit & vitals -> `web-quality`
- Search engine optimization -> `seo`
- Parallel specialized work -> `orchestration`
- Milestone review -> `retrospective`


## Source of Truth
- **Product & Requirements**: `SPEC.md`, `docs/product/`
- **Engineering Laws & Invariants**: `AI_CONSTITUTION.md`, `docs/architecture/INVARIANTS.md`
- **Architecture & ADRs**: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/DECISIONS.md`, `docs/architecture/ADR/`
- **Personal Defaults**: `.agents/defaults/preferences.yaml`, `docs/design/DESIGN_DEFAULTS.md`
- **Design & UI**: `docs/design/DESIGN_SYSTEM.md`, `docs/design/DESIGN_BRIEF.md`, `design-system/`
- **Engineering Depth**: `docs/engineering/` (TECH_STACK, ERROR_HANDLING, IDEMPOTENCY, OBSERVABILITY, RELEASE, DEPENDENCIES)
- **Testing & Quality**: `docs/engineering/TESTING.md`, `tests/`
- **Workflow & Lifecycle**: `docs/AI/AI_WORKFLOW.md`

## Context Engineering Rule
Do not read every document by default.
Load only the documentation, rules, and skills relevant to the current task. Never inject unnecessary files into context.

## File Header Rule
Every human-maintained source file where comments are valid must begin with:
```text
/*
 * filename.extension
 * What this file does.
 * Why this file matters.
 */
```
No emojis. No em dashes. Short, factual, and professional.

## Completion Contract
Never claim a task is complete without verification evidence:
1. Targeted tests pass.
2. Typecheck passes.
3. Lint passes.
4. Build passes if applicable.
5. Report exactly what was executed and what was not.
