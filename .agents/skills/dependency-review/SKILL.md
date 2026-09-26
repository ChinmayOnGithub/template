---
name: dependency-review
description: Evaluate third-party packages, licenses, security vulnerabilities, bundle size impact, and prevent dependency bloat.
---

# Dependency Review Skill

Run this skill before adding any new npm / bun dependency.

## 1. Evaluation Protocol
Before proposing `bun add <pkg>`, check:
1. **Can this be solved with native APIs?** (e.g. `fetch`, Web Crypto, native `URL`, `Intl`).
2. **Does an existing installed package already solve this?**
3. **Bundle Size**: Check bundle impact (`bundlephobia.com`). Reject heavy dependencies for simple helpers.
4. **Maintenance Health**: Is the repository actively maintained with low open security CVEs?
5. **License**: Is the license permissive (MIT, Apache-2.0, BSD)? Reject restrictive copyleft (GPL) in commercial codebases.
