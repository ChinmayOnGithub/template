---
name: documentation
description: Prevent documentation drift by keeping specifications, architectural records, API references, and READMEs in sync with code.
---

# Documentation Skill

Use this workflow whenever changing system behavior, adding features, or deprecating interfaces.

## 1. Documentation Drift Checklist
When modifying code, ask:
- [ ] Does `SPEC.md` require updating to reflect the new feature or scope?
- [ ] Does `docs/architecture/ARCHITECTURE.md` or `INVARIANTS.md` need adjustment?
- [ ] Is an ADR required in `docs/architecture/ADR/`?
- [ ] Does `README.md` need updated setup instructions or environment variables?
- [ ] Do component docstrings or TypeScript interface definitions need updating?
