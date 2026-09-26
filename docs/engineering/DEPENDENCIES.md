# Dependency Management Policy (DEPENDENCIES.md)

This document establishes the criteria and procedures for introducing, managing, and deprecating third-party software dependencies.

---

## 1. The Core Philosophy

> **Every dependency must earn its place.**

Third-party packages accelerate development, but every external dependency introduces supply chain risk, bundle weight, transitive vulnerabilities, and maintenance overhead. Never install a package casually without evaluating alternatives.

---

## 2. Evaluation Criteria Before Adding a Dependency

Before running `bun add`, `npm install`, `cargo add`, or equivalent, evaluate:

1. **Native / Standard Library Feasibility**:
   Can this problem be solved cleanly using language standard libraries or native platform APIs?
   *(e.g., native `fetch`, Web Crypto API, `URL`, `Intl`, `structuredClone`)*
2. **Existing Project Dependencies**:
   Does an already installed package provide this capability or a comparable utility?
3. **Bundle Weight & Performance**:
   What is the unminified and gzipped impact on client bundles? Use Bundlephobia or package analyzers to evaluate footprint. Reject bloated libraries for simple utility functions.
4. **Maintenance Health & Community Trust**:
   - When was the last commit or release?
   - Are maintainers actively responding to issues and pull requests?
   - Is the project backed by a credible organization or active community?
5. **License Compatibility**:
   - Permissive licenses approved for commercial use: MIT, Apache-2.0, BSD-2-Clause, BSD-3-Clause, ISC.
   - Restrictive copyleft licenses (GPL, AGPL) require explicit review and are prohibited in proprietary packages.
6. **Security & Vulnerability History**:
   Inspect npm audit / GitHub Advisory database. Avoid packages with unpatched CVEs or excessive transitive dependency trees.

---

## 3. Managing and Auditing Dependencies

1. **Lockfiles**:
   Always commit lockfiles (`bun.lock`, `package-lock.json`, `Cargo.lock`) to git to ensure reproducible builds across development and CI environments.
2. **Automated Audits**:
   CI runs automated dependency security audits via `.github/workflows/security.yml`. Any critical or high vulnerability must be patched before release.
3. **Removing Unused Dependencies**:
   Periodically run depcheck or build analysis. If a feature is deprecated or refactored, remove its corresponding dependencies immediately.
