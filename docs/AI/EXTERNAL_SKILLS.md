# External Agent Skills Registry & Provenance

This document tracks all external agent skills imported into `.agents/skills/`. It records their source repositories, upstream authors, licenses, selection rationale, and update procedures to ensure supply-chain transparency and reproducibility.

## Architectural Model: Orchestration & Sovereignty

```text
                        Universal Template
                               │
               ┌───────────────┴───────────────┐
               │                               │
        LOCAL KNOWLEDGE               EXTERNAL EXPERTISE
               │                               │
       Personal Defaults                 UI & Visual Composition
       Project Initialization            Design Systems
       Project Architecture              UX Usability & Writing
       Project-Type Guidance             Accessibility (WCAG)
       Idempotency & Envelopes           Tailwind CSS (v4)
       Data Modeling & Invariants        System Architecture (1st Principles)
       Template Maintenance              Documentation & ADRs
                                         Hypothesis-Driven Debugging
                                         Test-Driven Development (TDD)
                                         Eval-Driven Development (EDD)
                                         Agentic Browser Testing
                                         Security Review
                                         Planning With Files
                                         Performance Optimization
```

### Hierarchy of Truth
External skills provide **general methodology**. They never override project-level truth:
1. **Highest Priority**: `SPEC.md`, `AI_CONSTITUTION.md`, `docs/architecture/INVARIANTS.md`.
2. **Personal Defaults**: `.agents/defaults/preferences.yaml`, `docs/design/DESIGN_DEFAULTS.md`.
3. **Project Architecture**: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/ADR/`.
4. **Methodology**: External Agent Skills in `.agents/skills/`.

---

## Imported External Skills

| Skill Directory | Source Repository | Upstream Author / Vendor | License | Date Imported | Purpose & Scope | Replaced Local Item |
|---|---|---|---|---|---|---|
| `accessibility-inclusive-design` | [`hueyexe/frontend-agent-skills`](https://github.com/hueyexe/frontend-agent-skills) | Huey | MIT | 2026-09-27 | Actionable WCAG 2.1/2.2 audit, screen reader matrix, and inclusive design patterns | Replaced local `accessibility` |
| `agentic-browser-testing` | [`petrkindlmann/qa-skills`](https://github.com/petrkindlmann/qa-skills) | Petr Kindlmann | MIT | 2026-09-27 | Goal-driven E2E browser agent testing, Playwright accessibility-tree exploration, deterministic oracles, graduation to scripted tests | Replaced local `browser-testing` |
| `debugger` | [`aigis-solutions/agent-skills`](https://github.com/aigis-solutions/agent-skills) | Aigis Solutions | MIT | 2026-09-27 | 7-step hypothesis-driven root-cause debugging preventing speculative edit loops | Replaced local `debugging` |
| `define-evals` | [`savitharaghunathan/eval-driven-development`](https://github.com/savitharaghunathan/eval-driven-development) | Savitha Raghunathan | MIT | 2026-09-27 | Derives objective evaluation suites, graders, and quality metrics directly from specs before implementation | Replaced local `eval-driven-development` |
| `design-systems-frontend-architecture` | [`hueyexe/frontend-agent-skills`](https://github.com/hueyexe/frontend-agent-skills) | Huey | MIT | 2026-09-27 | Scalable design tokens, component contracts, responsive layout strategies, and token governance | Replaced local design system guidance |
| `documentation-and-adrs` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | Addy Osmani | MIT / Apache-2.0 | 2026-09-27 | Records architectural decisions, alternatives, and technical documentation | Replaced local `adr` & `documentation` |
| `performance-optimization` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | Addy Osmani | MIT / Apache-2.0 | 2026-09-27 | Profiling CWV, eliminating N+1 queries, memory leaks, and framework rendering bottlenecks | Replaced local `performance-review` |
| `planning-with-files` | [`soucod/planning-with-files-skill`](https://github.com/soucod/planning-with-files-skill) | Soucod | MIT | 2026-09-27 | File-based persistent planning (`task_plan.md`, `findings.md`, `progress.md`) for multi-step agent work | New capability (replaces manual ad-hoc planning) |
| `security-review` | [`getsentry/skills`](https://github.com/getsentry/skills) | Sentry | Apache-2.0 | 2026-09-27 | High-confidence exploitable vulnerability detection, OWASP Top 10, auth/authz audit | Replaced local `security-review` |
| `system-design-first-principles` | [`snepraj2709/system-design-first-principles-skill`](https://github.com/snepraj2709/system-design-first-principles-skill) | snepraj2709 | MIT | 2026-09-27 | First-principles system design, boundaries, state ownership, failure modes, and scale | Replaced local `architecture` |
| `tailwind-css` | [`PaulRBerg/agent-skills`](https://github.com/PaulRBerg/agent-skills) | Paul R Berg | MIT | 2026-09-27 | Dedicated Tailwind CSS v4 styling, variants (`tailwind-variants`, `tw-animate-css`), and clean token respect | New capability |
| `test-driven-development` | [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills) | Addy Osmani | MIT / Apache-2.0 | 2026-09-27 | Rigorous red-green-refactor TDD loop treating bug repros as tests first | Replaced local `testing` |
| `ui-visual-composition` | [`hueyexe/frontend-agent-skills`](https://github.com/hueyexe/frontend-agent-skills) | Huey | MIT | 2026-09-27 | High-density visual hierarchy, spacing, typography, depth, chromatic accents, and visual states | Replaced generic `frontend-design` |
| `ux-usability-foundations` | [`hueyexe/frontend-agent-skills`](https://github.com/hueyexe/frontend-agent-skills) | Huey | MIT | 2026-09-27 | Usability heuristics, affordances, feedback, error prevention, and cognitive load management | Replaced local `ui-ux` |
| `ux-writing-content-design` | [`hueyexe/frontend-agent-skills`](https://github.com/hueyexe/frontend-agent-skills) | Huey | MIT | 2026-09-27 | Microcopy, empty states, error explanations, labels, CTAs, and onboarding content | Replaced local UI prose writing |

---

## Local Sovereign Skills Retained

The following skills are intentionally retained locally in `.agents/skills/` because they encode repository-specific orchestration, personal defaults, or project contracts:

1. **`new-project`**: Project bootstrap sequence, framework pruning, platform asset generation.
2. **`project-audit`**: Evidence-based, technology-agnostic codebase health auditing across the 6 core pillars.
3. **`api-design`**: Standardized response envelopes, schema validation, and idempotency key conventions.
4. **`backend-design`**: Layer flow (Presentation -> Action -> Service -> Database) and transaction boundaries.
5. **`data-modeling`**: Domain data models, audit history, and multi-tenant isolation guarantees.
6. **`database-design`**: Relational & document schema modeling, indexing access patterns, and safe migrations.
7. **`dependency-review`**: Lightweight third-party license and bundle review checklist.

---

## Maintenance & Update Protocol

To update an external skill package in the future:
```bash
npx skills@latest update <skill-name>
```
Or to reinstall/resync:
```bash
npx skills@latest add <owner>/<repo> --skill <skill-name> -y
```
Always verify diffs and run repository validation after updating any skill.
