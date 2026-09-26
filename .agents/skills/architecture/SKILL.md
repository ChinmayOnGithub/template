---
name: architecture
description: Design clean system boundaries, state ownership, error handling strategies, and data invariants before implementing code.
---

# Architecture Skill

Use this workflow when creating new domain modules, integrating third-party systems, or restructuring existing services.

## 1. Architectural Checklist
1. **State Ownership**: Exactly which component, service, or database table owns this state?
2. **Layer Flow**: Does the mutation adhere to Presentation -> Action -> Service -> Database?
3. **Failure Scenarios**: What happens if the network drops? What happens on conflict or timeout?
4. **Data Invariants**: What properties must remain true under all conditions? (Document in `docs/architecture/INVARIANTS.md`).
5. **No Premature Abstraction**: Never introduce abstract factories or multi-layered indirection for code that is used in only one place.

## 2. Decision Capture
If the choice involves irreversible tradeoffs or multi-service impact, write an ADR in `docs/architecture/ADR/`.
