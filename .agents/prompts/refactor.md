# Refactoring Prompt

Use this prompt when restructuring legacy code, splitting oversized files, or cleaning technical debt.

## Task
Refactor target components without altering public behavior or breaking existing contracts.

## Rules
1. Run existing tests to establish a green baseline.
2. Refactor in small, verifiable increments.
3. Preserve public function signatures and API contracts.
4. Verify types and tests after every intermediate step.
5. Remove dead code and unused imports.
