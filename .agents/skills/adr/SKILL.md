---
name: adr
description: Author and manage Architectural Decision Records (ADR) capturing context, options, tradeoffs, and rationale.
---

# Architectural Decision Record (ADR) Skill

Use this workflow whenever making architectural decisions with long-term consequences.

## 1. When to Write an ADR
Write an ADR when:
- Selecting an architectural pattern, database engine, or communication protocol.
- Deciding between multiple viable state management strategies.
- Introducing a constraint that affects future developer workflows.

## 2. ADR Workflow
1. Create a numbered document: `docs/architecture/ADR/ADR-XXX-<title>.md`.
2. Follow the standard template:
   - **Status**: Proposed / Accepted / Deprecated.
   - **Context**: Problem statement and forces at play.
   - **Decision**: The selected option and technical justification.
   - **Consequences**: Positive outcomes and accepted tradeoffs.
   - **Alternatives Considered**: Why competing alternatives were dismissed.
