---
name: testing
description: Write targeted, deterministic unit and integration tests asserting business logic, error paths, and edge cases.
---

# Testing Skill

Use this workflow when adding features or fixing bugs to prevent regressions.

## 1. Targeted Test Strategy
- **Smallest Meaningful Test**: Do not write monolithic tests that verify everything at once. Write laser-focused tests that assert one invariant or behavior per block.
- **Test Boundaries**:
  - Valid input -> expected output/state.
  - Invalid input -> typed error / exception.
  - Network/database failure -> graceful error handling & rollback.

## 2. Execution Guidelines
- Run targeted tests: `bun test path/to/my-test.test.ts`.
- Run full test suite before committing: `bun test`.
- Clean up test state: reset mocks, clear temporary databases, and avoid global test pollution.
