# Code Review Prompt

Use this prompt before merging or committing substantial changes.

## Task
Review proposed code diffs against engineering standards, type safety, and product invariants.

## Inspection Checklist
1. **File Headers and Comments**:
   - Do all modified or created files include the required header?
   - Are comments factual, useful, and free of emojis and em dashes?
2. **Layer Separation and Modularity**:
   - Are responsibilities cleanly divided? No business logic in UI or controllers.
   - Are functions small and focused?
3. **Type Safety**:
   - Zero `any` or loose casts.
4. **Security and Invariants**:
   - Tenant isolation verified.
   - Soft-delete invariants respected.
5. **Verification**:
   - Have all relevant tests, typechecks, and lints been executed?
