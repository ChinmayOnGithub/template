---
name: project-audit
description: Systematically audit repository architecture, code duplication, security vulnerabilities, dead code, and invariant violations.
---

# Project Audit Skill

Use this workflow to perform comprehensive codebase health audits.

## 1. Audit Dimensions
When conducting an audit, evaluate across these 6 pillars:
1. **Architecture & Invariants**: Are state mutations respecting layer boundaries? Are soft-delete invariants upheld?
2. **Code Cleanliness & Duplication**: Identify copy-pasted logic, unused functions, or bloated multi-thousand line files.
3. **Security & Data Isolation**: Verify user session validation, SQL injection safeguards, and secret leakage.
4. **Performance & Bundle**: Detect unindexed queries, expensive loops, N+1 patterns, and heavy dependencies.
5. **Testing & Eval Health**: Check test coverage across domain services and ensure evals are passing.
6. **Design System Adherence**: Check for raw `<button>` tags, hardcoded colors, and missing loading/empty states.

## 2. Severity Classification
- **CRITICAL**: Immediate security risk, data loss hazard, or invariant violation.
- **HIGH**: Performance bottleneck, missing authorization check, or untested mutation.
- **MEDIUM**: Code duplication, missing empty state, or styling inconsistency.
- **LOW**: Minor documentation drift or cosmetic formatting issue.
