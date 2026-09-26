# Architectural Decisions Log (DECISIONS.md)

This log indexes all Architectural Decision Records (ADRs) for this project.
Each ADR documents the context, options evaluated, chosen approach, consequences, and tradeoffs for decisions that have structural or long-term impact.

---

## Decision Records Index

| ID | Title | Status | Date | Decision Summary | File Link |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ADR-001 | Template Decision Record | Accepted | Initial | Establishes standard ADR lifecycle and format | [ADR-001](ADR/ADR-001-template.md) |

---

## When to Write an ADR

Write an ADR when a decision involves:
1. Long-term architectural consequences or multi-module impact.
2. Selection between multiple viable technologies, patterns, or protocols.
3. Establishing irreversible constraints or tradeoffs.
4. Modifying foundational data modeling, state ownership, or communication strategies.

Trivial choices (e.g. naming a variable, helper function location) do not require an ADR.

---

## ADR Lifecycle Statuses

- **Proposed**: Under review and open for team or agent discussion.
- **Accepted**: Decision confirmed and approved for implementation.
- **Superseded**: Replaced by a subsequent decision (link to the new ADR).
- **Deprecated**: Abandoned or removed from the system.
