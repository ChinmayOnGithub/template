---
name: eval-driven-development
description: Build objective, executable evaluation suites verifying complex user journeys, multi-step actions, and product specifications.
---

# Eval-Driven Development (EDD) Skill

Use this workflow to establish objective criteria for AI-driven code generation and feature completeness.

## 1. The EDD Loop
```
SPEC -> WRITE EVALS (tests/evals/) -> IMPLEMENTATION -> RUN EVALS -> VERIFIED PASS
```

## 2. Anatomy of an Eval
An eval differs from a simple unit test: it tests end-to-end user intent and state invariants across multiple interactions.
Example:
- Feature: "User uploads and reorders images"
- Eval assertions:
  1. Valid JPEG uploaded successfully and saved to store.
  2. Oversized payload (>10MB) returns typed rejection without crashing.
  3. Dragging item 3 to slot 1 updates ordering index in persistent store.
  4. Page refresh preserves newly persisted ordering.

## 3. Directory Layout
- `tests/evals/product/`: User journeys and business workflows.
- `tests/evals/architecture/`: Dependency boundaries and tenant isolation assertions.
- `tests/evals/regression/`: Past critical bug scenarios converted to permanent evals.
- `tests/evals/agent/`: Scenarios validating agent deterministic tool execution.
