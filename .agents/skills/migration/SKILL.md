---
name: migration
description: Execute safe architectural refactorings, database schema migrations, and state transitions without breaking existing data.
---

# Migration Skill

Use this workflow when modifying database schemas, refactoring core abstractions, or migrating state structures.

## 1. Safe Migration Sequence
1. **Inventory**: Map all dependencies, consumers, and data touchpoints.
2. **Backward-Compatible Schema Change**:
   - Add new nullable columns or tables first.
   - Never rename or drop active columns in a single destructive step.
3. **Data Backfill**: Write an idempotent backfill script populating new structures.
4. **Switch Consumers**: Update service code to write to both / read from new model.
5. **Verify**: Run tests and evals to confirm zero data corruption.
6. **Deprecate & Clean**: Remove legacy columns only after full verification.
