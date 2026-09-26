# External Agent Skills Registry & Provenance

This document tracks all external and community agent skills imported into `.agents/skills/`. It records their upstream repositories, exact commit SHAs, authors, licenses, selection rationale, adaptation notes, and overlap resolutions to ensure supply-chain transparency, safety, and reproducibility.

---

## 1. Architectural Model: Orchestration & Sovereignty

```text
                             Universal AI Template
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
         LOCAL KNOWLEDGE                              EXTERNAL EXPERTISE
                │                                             │
      Personal Defaults                             UI & Visual Composition
      Project Initialization                        Design Systems
      Project Architecture                          UX Usability & Writing
      Project-Type Guidance                         Accessibility (WCAG 2.2)
      Idempotency & Envelopes                       Tailwind CSS (v4)
      Database Schema & Migrations                  System Architecture (1st Principles)
      Data Modeling & Isolation                     Documentation & ADRs
      Template Maintenance                          Hypothesis-Driven Debugging
                                                    Test-Driven Development (TDD)
                                                    Eval-Driven Development (EDD)
                                                    Agentic Browser Testing
                                                    Security Review & Threat Modeling
                                                    Planning With Files
                                                    Performance Optimization
                                                    Requirements Grilling & Specs
                                                    Domain Modeling & Task Tickets
                                                    Context Engineering
                                                    Code Review & PR Code Review
                                                    Simplification & Refactoring
                                                    Repository Cleanup
                                                    Dependency Audit & Upgrade
                                                    Observability & Incident Review
                                                    Deployment Pre-Flight Review
                                                    Convention Rationale (Why-We-Do-This)
                                                    Evolving Project Memory
                                                    Git Branch & Commit Workflow
                                                    Web Quality & SEO
                                                    Multi-Model Orchestration
                                                    Milestone Retrospectives
```

---

## 2. Hierarchy of Truth

External skills provide **general methodology and execution workflows**. They never override project-level truth:

1. **Level 1 (Ultimate Truth)**: `SPEC.md`, `AI_CONSTITUTION.md`, `docs/architecture/INVARIANTS.md`.
2. **Level 2 (Personal Defaults)**: `.agents/defaults/preferences.yaml`, `docs/design/DESIGN_DEFAULTS.md`.
3. **Level 3 (Project Decisions)**: `docs/architecture/ARCHITECTURE.md`, `docs/architecture/ADR/`.
4. **Level 4 (Methodology & Workflow)**: `.agents/skills/` (external + local skills). An external skill must never override Level 1-3.

### Project Memory Precedence Rule
Project Memory (`.agents/skills/project-memory/`) captures evolving context across development sessions. Under no circumstances may memory files in `.agents/memory/` override, conflict with, or silently replace explicit decisions recorded in `SPEC.md`, `AI_CONSTITUTION.md`, `INVARIANTS.md`, or approved ADRs in `docs/architecture/ADR/`. If a conflict occurs, Level 1 and Level 3 files strictly prevail.

---

## 3. Imported Community & External Skills Registry

All community skills were inspected for malicious code, destructive commands, secret leaks, and unnecessary dependencies prior to installation.

| Capability | Skill Name | Upstream Repository | Exact Commit / Version | License | Local Path | Copied or Adapted | Adaptation Reason / Notes | Verified | Date Reviewed |
|---|---|---|---|---|---|---|---|---|---|
| Project Setup | `project-setup` | `britt/agent-skills` | `e92fbf88b40641fa4b7fab8bf911d1edb7a66c0f` | MIT | `.agents/skills/project-setup/` | Adapted | Tailored to this repository's bootstrap sequence (`.agents/prompts/new-project.md`), preserving personal defaults and multi-platform project types | Yes | 2026-09-27 |
| Project Analysis | `project-analysis` | `britt/agent-skills` | `e92fbf88b40641fa4b7fab8bf911d1edb7a66c0f` | MIT | `.agents/skills/project-analysis/` | Copied | Rapid multi-axis codebase assessment without reading the entire repository; covers structure, manifests, architecture, dependencies, and risks | Yes | 2026-09-27 |
| Requirements Grilling | `grilling` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/grilling/` | Copied | Clarifies underspecified requirements, uncovers hidden assumptions, and surfaces missing architectural decisions without asking questions already answered in project docs | Yes | 2026-09-27 |
| Domain Modeling | `domain-modeling` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/domain-modeling/` | Copied | Extracts ubiquitous language, bounded contexts, domain invariants, and key workflows independent of database schemas | Yes | 2026-09-27 |
| Spec Generation | `to-spec` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/to-spec/` | Copied | Converts validated requirements into structured product specifications with explicit scope boundaries and acceptance criteria | Yes | 2026-09-27 |
| Ticket Decomposition | `to-tickets` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/to-tickets/` | Copied | Decomposes specifications into implementation-sized atomic tickets with clear dependency sequencing and verification targets | Yes | 2026-09-27 |
| Context Engineering | `context-engineering` | `fending/context-engineering` | `a6d7396a57b6492f22f2316f6c2867994165167b` | MIT | `.agents/skills/context-engineering/` | Adapted | Reinforces repository core principle: "Do not read every document by default". Formulates token budgeting, context boundaries, and task-specific loading | Yes | 2026-09-27 |
| Persistent Task Planning | `planning-with-files` | `OthmanAdi/planning-with-files` | `4d24d9a8a2baa55a15e7f8f9ec6da8d19793ee8c` | Apache-2.0 | `.agents/skills/planning-with-files/` | Copied | Replaced older `soucod` implementation. Maintains persistent task plans (`task_plan.md`, `findings.md`, `progress.md`) for 5+ step tasks | Yes | 2026-09-27 |
| Code Quality Review | `code-review` | `khasky/awesome-agent-skills` | `105c7d22f0bd08f78e82fc6ed19d5f29a3ca2f84` | MIT | `.agents/skills/code-review/` | Copied | Holistic independent code review (correctness, requirements, architecture, security, maintainability, error handling) without modifying code | Yes | 2026-09-27 |
| Pull Request Review | `pr-code-review` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/pr-code-review/` | Copied | Dedicated PR diff review checking spec compliance, regression risks, missing tests, and actionable findings | Yes | 2026-09-27 |
| Code Simplification | `simplification` | `tomazb/agent-skills` | `63fcba046a5c15a92d14f223f0283eb9d49c2359` | MIT | `.agents/skills/simplification/` | Copied | Eliminates unnecessary abstractions, cognitive bloat, and redundant indirections without changing observable behavior | Yes | 2026-09-27 |
| Disciplined Refactoring | `refactoring` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/refactoring/` | Copied | Structured refactoring workflow requiring established safety net, small atomic steps, observable behavior preservation, and continuous verification | Yes | 2026-09-27 |
| Repository Hygiene | `repository-cleanup` | `khasky/awesome-agent-skills` | `105c7d22f0bd08f78e82fc6ed19d5f29a3ca2f84` | MIT | `.agents/skills/repository-cleanup/` | Copied | Safe identification and removal of dead code, unused files, duplicate helpers, and stale AI artifacts | Yes | 2026-09-27 |
| Dependency Audit | `dependency-audit` | `khasky/awesome-agent-skills` | `105c7d22f0bd08f78e82fc6ed19d5f29a3ca2f84` | MIT | `.agents/skills/dependency-audit/` | Copied | Read-only evaluation of third-party dependencies, security advisories, bundle bloat, stale packages, and license compatibility (replaced local `dependency-review`) | Yes | 2026-09-27 |
| Dependency Upgrade | `dependency-upgrade` | `khasky/awesome-agent-skills` | `105c7d22f0bd08f78e82fc6ed19d5f29a3ca2f84` | MIT | `.agents/skills/dependency-upgrade/` | Copied | Stepwise dependency upgrade execution with changelog review, breaking change detection, and automated test validation | Yes | 2026-09-27 |
| Threat Modeling | `threat-model` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/threat-model/` | Copied | Pre-implementation STRIDE/LINDDUN threat modeling identifying assets, trust boundaries, threat actors, and mitigations | Yes | 2026-09-27 |
| Observability Review | `observability-review` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/observability-review/` | Copied | Assesses production telemetry: structured logs, health signals, metrics, distributed traces, and diagnostic error contexts | Yes | 2026-09-27 |
| Deployment Checklist | `deployment-review` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/deployment-review/` | Copied | Pre-flight release verification covering builds, env vars, schema migrations, rollbacks, and health checks across cloud or standalone deployments | Yes | 2026-09-27 |
| Incident Review | `incident-review` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/incident-review/` | Copied | Blameless post-mortem analysis documenting timeline, root causes, contributing factors, what went well, and corrective action items | Yes | 2026-09-27 |
| Engineering Rationale | `why-we-do-this` | `schubergphilis/agents.md` | `22ad1754fa75cd3ed782bdef11a32aaa7a78c5e8` | Apache-2.0 | `.agents/skills/why-we-do-this/` | Copied | Explains project conventions through failure prevention, tradeoffs, and concrete historical evidence; complements formal ADRs | Yes | 2026-09-27 |
| Project Memory | `project-memory` | `tasuku-9/project-memory-skill` | `de8a47d555105eccfafa1e2f050f43c8de2d48ce` | MIT | `.agents/skills/project-memory/` | Adapted | Adapted with strict subordination to SPEC/ADR/INVARIANTS; captures evolving project notes in `.agents/memory/` | Yes | 2026-09-27 |
| Git Workflow | `git-workflow` | `netresearch/git-workflow-skill` | `09f4975979da3d1c6ba56dd1db9165cfd39ba5d0` | MIT | `.agents/skills/git-workflow/` | Copied | Enforces atomic Conventional Commits, branch naming conventions, PR hygiene, and safe merge conflict resolution | Yes | 2026-09-27 |
| Web Quality Audit | `web-quality` | `addyosmani/web-quality-skills` | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | Apache-2.0 | `.agents/skills/web-quality/` | Copied | Evaluates Core Web Vitals (LCP, INP, CLS), mobile viewport responsiveness, runtime console health, and accessibility (web apps only) | Yes | 2026-09-27 |
| SEO Optimization | `seo` | `addyosmani/web-quality-skills` | `afa8da942115f2961fdbfa80807ea0b232ff6c00` | Apache-2.0 | `.agents/skills/seo/` | Copied | Technical SEO audit: meta title/description, canonical tags, structured data (JSON-LD), crawlability (`robots.txt`), and sitemaps | Yes | 2026-09-27 |
| Model Orchestration | `orchestration` | `fdarkaou/agent-skills` | `1acbb6b1a9b94f9e24760d9279fd87a2faa898b6` | MIT | `.agents/skills/orchestration/` | Adapted | Multi-agent task decomposition where main agent retains sole integration and verification responsibility | Yes | 2026-09-27 |
| Retrospective & AAR | `retrospective` | `neurofoo/agent-skills` | `0e7ac2aa4d094352a082ebeedf1dbb4c52b77782` | MIT | `.agents/skills/retrospective/` | Adapted | Synthesizes After-Action Review (AAR) and milestone retrospectives to capture learnings after major releases; omitted for trivial tasks | Yes | 2026-09-27 |
| Accessibility & WCAG | `accessibility-inclusive-design` | `hueyexe/frontend-agent-skills` | `d9e7a83f12` | MIT | `.agents/skills/accessibility-inclusive-design/` | Copied | Actionable WCAG 2.1/2.2 audit, screen reader matrix, and inclusive design patterns | Yes | 2026-09-27 |
| Browser Testing | `agentic-browser-testing` | `petrkindlmann/qa-skills` | `b38e07c` | MIT | `.agents/skills/agentic-browser-testing/` | Copied | Goal-driven E2E browser agent testing, Playwright accessibility-tree exploration, deterministic oracles | Yes | 2026-09-27 |
| Root-Cause Debugging | `debugger` | `aigis-solutions/agent-skills` | `432b012` | MIT | `.agents/skills/debugger/` | Copied | 7-step hypothesis-driven root-cause debugging preventing speculative edit loops | Yes | 2026-09-27 |
| Eval-Driven Development | `define-evals` | `savitharaghunathan/eval-driven-development` | `7739c3e` | MIT | `.agents/skills/define-evals/` | Copied | Derives objective evaluation suites, graders, and quality metrics directly from specs before implementation | Yes | 2026-09-27 |
| Frontend Architecture | `design-systems-frontend-architecture` | `hueyexe/frontend-agent-skills` | `d9e7a83f12` | MIT | `.agents/skills/design-systems-frontend-architecture/` | Copied | Scalable design tokens, component contracts, responsive layout strategies, and token governance | Yes | 2026-09-27 |
| Architecture Decisions | `documentation-and-adrs` | `addyosmani/agent-skills` | `c830e99` | MIT / Apache-2.0 | `.agents/skills/documentation-and-adrs/` | Copied | Records architectural decisions, alternatives, and technical documentation | Yes | 2026-09-27 |
| Performance Optimization | `performance-optimization` | `addyosmani/agent-skills` | `c830e99` | MIT / Apache-2.0 | `.agents/skills/performance-optimization/` | Copied | Profiling CWV, eliminating N+1 queries, memory leaks, and framework rendering bottlenecks | Yes | 2026-09-27 |
| Security Code Review | `security-review` | `getsentry/skills` | `45ac018` | Apache-2.0 | `.agents/skills/security-review/` | Copied | High-confidence exploitable vulnerability detection, OWASP Top 10, auth/authz audit | Yes | 2026-09-27 |
| First-Principles Architecture | `system-design-first-principles` | `snepraj2709/system-design-first-principles-skill` | `371bc09` | MIT | `.agents/skills/system-design-first-principles/` | Copied | First-principles system design, boundaries, state ownership, failure modes, and scale | Yes | 2026-09-27 |
| Tailwind CSS v4 | `tailwind-css` | `PaulRBerg/agent-skills` | `ee71112` | MIT | `.agents/skills/tailwind-css/` | Copied | Dedicated Tailwind CSS v4 styling, variants (`tailwind-variants`, `tw-animate-css`), and clean token respect | Yes | 2026-09-27 |
| Test-Driven Development | `test-driven-development` | `addyosmani/agent-skills` | `c830e99` | MIT / Apache-2.0 | `.agents/skills/test-driven-development/` | Copied | Rigorous red-green-refactor TDD loop treating bug repros as tests first | Yes | 2026-09-27 |
| Visual Composition | `ui-visual-composition` | `hueyexe/frontend-agent-skills` | `d9e7a83f12` | MIT | `.agents/skills/ui-visual-composition/` | Copied | High-density visual hierarchy, spacing, typography, depth, chromatic accents, and visual states | Yes | 2026-09-27 |
| Usability Heuristics | `ux-usability-foundations` | `hueyexe/frontend-agent-skills` | `d9e7a83f12` | MIT | `.agents/skills/ux-usability-foundations/` | Copied | Usability heuristics, affordances, feedback, error prevention, and cognitive load management | Yes | 2026-09-27 |
| UX Writing | `ux-writing-content-design` | `hueyexe/frontend-agent-skills` | `d9e7a83f12` | MIT | `.agents/skills/ux-writing-content-design/` | Copied | Microcopy, empty states, error explanations, labels, CTAs, and onboarding content | Yes | 2026-09-27 |

---

## 4. Skills Overlap & Boundaries Resolution

To prevent role ambiguity, redundant skill execution, or conflicting advice, every potential overlap was analyzed and resolved:

| Skill Pair / Group | Responsibilities | Overlap Analysis | Resolution & Boundary Decision |
|---|---|---|---|
| `system-design-first-principles` vs `backend-design` vs `api-design` | High-level system topology vs local layered backend flow vs HTTP contract design | All deal with architecture but at distinct abstraction tiers. | **Kept separate.** `system-design-first-principles` governs distributed boundaries and failure domains; `backend-design` governs internal code layering (Presentation -> Controller -> Service -> Data); `api-design` governs external JSON envelopes, status codes, and idempotency. |
| `test-driven-development` vs `define-evals` vs `agentic-browser-testing` | Unit/integration red-green-refactor vs LLM/eval benchmark design vs goal-driven browser E2E | All address testing and verification. | **Kept separate.** `test-driven-development` tests deterministic code logic; `define-evals` grades non-deterministic AI/LLM outputs; `agentic-browser-testing` executes autonomous UI accessibility-tree journeys. |
| `security-review` vs `threat-model` | Code vulnerability auditing vs pre-implementation threat modeling | Both address security. | **Kept separate.** `threat-model` is executed during design to analyze trust boundaries, threat actors, and attack surfaces (STRIDE); `security-review` is executed on completed code to find concrete injection, auth bypass, and secret leaks. |
| `performance-optimization` vs `web-quality` | Universal compute/database/memory tuning vs web client runtime quality audit | Both address performance. | **Kept separate.** `performance-optimization` is universal (eliminating N+1 queries, algorithm bottlenecks, memory leaks); `web-quality` audits web-specific Lighthouse metrics (LCP, INP, CLS) and viewport responsiveness. `web-quality` is strictly excluded for non-web projects. |
| `code-review` vs `pr-code-review` | Module/file implementation review vs pull request diff review | Both review code changes. | **Kept separate.** `code-review` evaluates general code quality, architecture adherence, and maintainability; `pr-code-review` specifically reviews PR git diffs against the pull request description, acceptance criteria, and regression risks. |
| `simplification` vs `refactoring` | Pruning unnecessary abstractions vs deliberate structural redesign | Both change code without altering behavior. | **Kept separate.** `simplification` strips accidental complexity, dead paths, and needless wrappers; `refactoring` systematically migrates architecture or prepares for new capabilities under an explicit safety net. |
| `repository-cleanup` vs `simplification` | Repository-wide asset/file hygiene vs file-level logic simplification | Both remove clutter. | **Kept separate.** `repository-cleanup` identifies orphaned files, unused exports, stale documentation, and AI clutter across the repo; `simplification` refactors complex functions and classes within active code files. |
| `new-project` / `project-setup` vs `to-spec` / `to-tickets` | Workspace scaffolding vs requirements decomposition | Both occur early in project lifecycle. | **Kept separate.** `project-setup` / `new-project` configures directories, manifests, toolchains, and project types; `to-spec` and `to-tickets` engineer product requirements into executable engineering tasks. |
| `planning-with-files` vs `project-memory` | Ephemeral task-scoped tracking vs long-lived cross-session knowledge base | Both persist state on disk. | **Kept separate.** `planning-with-files` manages scratch task progress (`task_plan.md`, `findings.md`) during complex multi-step sessions and resets; `project-memory` stores durable, evolving repository insights in `.agents/memory/` and is strictly subordinated to Level 1 and Level 3 truth. |
| `documentation-and-adrs` vs `why-we-do-this` | Formal system documentation & ADRs vs explanatory convention rationale | Both document engineering decisions. | **Kept separate.** `documentation-and-adrs` records formal decisions, API references, and architecture guides; `why-we-do-this` explains why specific constraints or conventions exist by documenting the concrete failures they prevent. |
| `debugger` vs `incident-review` | Active real-time bug diagnosis vs post-production outage retrospective | Both address software failures. | **Kept separate.** `debugger` runs hypothesis-driven investigation to diagnose broken tests and runtime bugs during development; `incident-review` conducts blameless post-mortems after production incidents to prevent systemic recurrence. |
| `data-modeling` vs `domain-modeling` | Database schema & persistence design vs business domain language & boundaries | Both model data and entities. | **Kept separate.** `domain-modeling` discovers ubiquitous language and bounded contexts from product requirements; `data-modeling` designs relational tables, normalization, foreign keys, indexes, and audit columns. |
| `dependency-audit` vs `dependency-upgrade` | Read-only risk/bloat assessment vs mutating dependency version bump | Both address third-party packages. | **Kept separate.** `dependency-audit` evaluates vulnerabilities, licenses, and bloat without making edits; `dependency-upgrade` executes package updates, reviews breaking changes, and runs validation suites. Legacy `dependency-review` was removed as redundant. |

---

## 5. Sovereign Local Skills Retained

The following skills are intentionally retained locally in `.agents/skills/` because they encode repository-specific orchestration, personal defaults, or project contracts:

1. **`new-project`**: Project bootstrap sequence, framework pruning, platform asset generation.
2. **`project-audit`**: Evidence-based, technology-agnostic codebase health auditing across the 6 core pillars.
3. **`api-design`**: Standardized response envelopes, schema validation, and idempotency key conventions.
4. **`backend-design`**: Layer flow (Presentation -> Action -> Service -> Database) and transaction boundaries.
5. **`data-modeling`**: Domain data models, audit history, and multi-tenant isolation guarantees.
6. **`database-design`**: Relational & document schema modeling, indexing access patterns, and safe migrations.

---

## 6. Maintenance & Verification Protocol

When adding, replacing, or updating external skills:
1. Inspect the full `SKILL.md`, scripts, and referenced files for shell injection, secret exposure, or destructive actions.
2. Verify YAML frontmatter with `name` and `description`.
3. Check for broken internal markdown links.
4. Run template verification:
   ```bash
   node .agents/scripts/validate-template.mjs
   node .agents/scripts/audit-context.mjs
   node .agents/scripts/check-headers.mjs
   ```
5. Record source repository, exact commit SHA, and license in this registry.
