# AI Engineering & Vibe Coding Workflow

This document outlines the standard end-to-end development methodology for building features reliably with AI agents without endless prompt cycles or hallucinations.

---

## The Canonical Development Lifecycle

```
             ┌──────────────┐
             │     YOU      │
             └──────┬───────┘
                    ▼
             [ IDEA / GOAL ]
                    ▼
          [ PRODUCT THINKING ]      (Skill: product-thinking)
                    ▼
              [ RESEARCH ]          (Skill: research)
                    ▼
            [ SPECIFICATION ]       (Artifact: SPEC.md)
                    ▼
             [ ARCHITECTURE ]       (Skill: architecture, docs/architecture/)
              ┌─────┴─────┐
              ▼           ▼
        [ DESIGN ]    [ EVALS ]     (Skill: frontend-design, tests/evals/)
              └─────┬─────┘
                    ▼
                 [ PLAN ]           (Step-by-step checklist)
                    ▼
              [ IMPLEMENT ]         (Using existing patterns & primitives)
                    ▼
             [ TEST & EVAL ]        (Skill: testing, eval-driven-development)
                    ▼
         [ BROWSER / VISUAL QA ]    (Skill: browser-testing, visual-qa)
                    ▼
                [ AUDIT ]           (Skill: project-audit, security-review)
                    ▼
               [ COMMIT ]           (Skill: git-workflow)
                    ▼
              [ DOCUMENT ]          (Skill: documentation, docs/architecture/ADR)
```

---

## 1. Product Thinking & Research Phase
- **Input**: Raw idea or user request.
- **Action**: Break down the core value proposition, eliminate non-goals, and check primary sources and competitors.
- **Output**: Clear user stories and technical constraints.

## 2. Specification & Invariants
- **Input**: Product brief and research notes.
- **Action**: Update `SPEC.md` and define what the system must guarantee.
- **Output**: Accepted scope and explicit behavioral boundaries.

## 3. Architecture & Evals (Before Coding)
- **Input**: `SPEC.md`.
- **Action**: Decide state ownership, boundaries, and write executable assertions (`tests/evals/`).
- **Output**: Objective pass/fail criteria before any implementation begins.

## 4. Implementation
- **Input**: Evals and design brief.
- **Action**: Build using design system primitives, minimal external dependencies, and strict type safety.
- **Output**: Working code that conforms to the design system.

## 5. Verification Harness
- **Verification Loop**:
  1. `bunx tsc --noEmit` (Zero type errors).
  2. Targeted unit/integration tests (`bun test`).
  3. Evals pass (`tests/evals/`).
  4. Browser inspection / Visual QA (Zero broken layouts, overflow, or contrast defects).

## 6. Audit, Commit & Document
- **Input**: Verified changes.
- **Action**: Run audit check, craft clean git commit, and capture any structural decision in an ADR.
