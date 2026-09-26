---
name: release
description: Manage version increments, changelog generation, release verification gates, deployment execution, and rollback strategies across project types.
---

# Release Engineering Skill

Use this workflow when cutting a new version, preparing a deployment, or releasing packages across project categories.

## 1. Pre-Release Verification Gate
Never initiate a release without running:
1. Automated test suite passes (`bun run test` / `vitest`).
2. Typecheck compiles with zero errors (`bun run typecheck`).
3. Linter and header check pass (`bun run lint`, `bun run check-headers`).
4. Production build completes successfully (`bun run build`).
5. Browser / E2E smoke tests pass for web projects (`bun run test:e2e`).

## 2. Versioning and Changelog
1. Determine SemVer bump:
   - `MAJOR`: Breaking changes or database schema incompatibilities.
   - `MINOR`: New features and backward-compatible enhancements.
   - `PATCH`: Bug fixes, security patches, and minor refactorings.
2. Update `package.json` (or platform manifest) version.
3. Update `CHANGELOG.md` with categorized entries (`Added`, `Changed`, `Fixed`, `Security`).

## 3. Deployment and Rollback Protocol
- Reference `docs/engineering/RELEASE.md` for specific category procedures (web rolling deploy, browser extension store packaging, VS Code extension publishing, native binary artifacts).
- If health checks fail or error rates spike post-release, trigger immediate rollback.
