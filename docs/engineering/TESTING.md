# Testing Strategy & Guidelines

## 1. Testing Pyramid
- **Evals (`tests/evals/`)**: High-level behavior assertions testing full user journeys and domain invariants against the spec.
- **Integration Tests (`tests/integration/`)**: Verification of actions, services, and database persistence in concert.
- **Unit Tests (`tests/unit/`)**: Granular verification of pure functions, algorithms, and validation schemas.
- **E2E / Browser Tests (`tests/e2e/`)**: Browser-driven smoke tests for critical user paths.

## 2. Test Execution Commands
```bash
# Run unit & integration test suites
bun test

# Run type check
bunx tsc --noEmit

# Run lint
bun run lint
```

## 3. Mocking & Determinism Rules
- Never use random seeds or unpredictable timestamps in tests.
- Reset mock state cleanly before each test run.
- Test actual behavior and error boundaries rather than mocking out every dependency.
