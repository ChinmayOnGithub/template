# Release Engineering (RELEASE.md)

This document establishes the release, versioning, deployment, and verification protocol across project categories.

---

## 1. Versioning Protocol

All projects adhere to Semantic Versioning (SemVer `MAJOR.MINOR.PATCH`):
- **MAJOR**: Breaking API, schema, or configuration changes requiring consumer intervention.
- **MINOR**: Backward-compatible new capabilities, features, or significant optimizations.
- **PATCH**: Backward-compatible bug fixes, security patches, or minor performance tweaks.

Maintain a clean `CHANGELOG.md` following Keep a Changelog standards (`Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`).

---

## 2. Release Lifecycle by Project Category

### A. Web and SaaS Applications
1. **Pre-deployment Verification**:
   - Run full CI pipeline (lint, typecheck, header check, unit tests, E2E tests).
   - Execute database migration dry-run on staging database.
2. **Database Migration Strategy**:
   - Always deploy backward-compatible schema changes first (expand phase).
   - Deploy new application code that writes to new structures.
   - Run backfill script if required.
   - Deprecate and remove obsolete columns in a subsequent release (contract phase).
3. **Deployment**:
   - Zero-downtime rolling deployment or blue-green deployment.
   - Assert health check endpoints return HTTP 200 before shifting traffic.
4. **Rollback Plan**:
   - If error rate exceeds 1% or health checks fail, revert container or edge deployment immediately.

### B. Browser Extensions (Chrome / Firefox)
1. **Pre-submission**:
   - Verify compliance with Manifest V3 policies and minimal permissions.
   - Produce deterministic zip bundle using automated packaging script.
2. **Submission**:
   - Submit package to Chrome Web Store and Firefox Add-ons (AMO).
   - Account for store review latency (24 to 72 hours).
3. **Rollback Strategy**:
   - Store updates cannot be instantly rolled back; ensure feature flags protect risky new workflows.

### C. Developer Extensions (VS Code)
1. Package extension using `@vscode/vsce package`.
2. Verify local installation with `code --install-extension <pkg>.vsix`.
3. Publish to Visual Studio Marketplace and Open VSX Registry.

### D. Native Systems and CLI Utilities
1. Build cross-platform release binaries with stripped debug symbols (`--release` or `-O3`).
2. Generate SHA-256 checksums and GPG signatures for all distribution artifacts.
3. Attach binaries and checksums to GitHub Releases.

---

## 3. Post-Release Verification Checklist

Immediately following release deployment:
- [ ] Verify production health check endpoints return HTTP 200.
- [ ] Verify core authentication and primary user journey in live environment.
- [ ] Inspect error monitoring dashboard (zero unexpected error spike).
- [ ] Verify critical background workers and cron schedules are active.
