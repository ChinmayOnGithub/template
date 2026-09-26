# Project Audit Prompt

Use this prompt to perform a periodic or pre-release repository audit.

## Task
Inspect the entire codebase across architecture, security, performance, tests, and documentation.

## Audit Output Structure
Classify findings into four severity levels:
- **CRITICAL**: Immediate security vulnerabilities, data corruption hazards, or broken invariants.
- **HIGH**: Missing test coverage on critical mutations, N+1 queries, unhandled error paths.
- **MEDIUM**: Code duplication, missing empty/loading states, styling inconsistencies.
- **LOW**: Minor documentation drift or cosmetic formatting inconsistencies.

Provide exact file references and concrete remediation proposals for each finding.
