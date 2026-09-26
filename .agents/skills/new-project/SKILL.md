---
name: new-project
description: Initialize a brand-new project repository from idea to implementation-ready state, applying personal defaults and removing irrelevant template material.
---

# New Project Initialization Skill

Use this workflow when bootstrapping a new repository from this template.

## 1. Project Initialization Sequence
1. **Discover Intent**:
   - Determine project name, core problem, target audience, and primary use case.
   - Classify into a category from `.agents/project-types/` (web, browser-extension, developer-extension, mobile, backend, native).
2. **Product and Business Foundation**:
   - Fill out `SPEC.md`, `docs/product/PRODUCT_BRIEF.md`, `docs/product/GOALS.md`, and `docs/product/BUSINESS_MODEL.md`.
3. **Technology Selection**:
   - Select appropriate language, framework, database, and testing tools.
   - Record selections and technical rationale in `docs/engineering/TECH_STACK.md`.
4. **Template Cleanup (Critical)**:
   - If the project is NOT a web application (e.g. CLI, backend, native, extension), remove irrelevant web files (`design-system/`, Next.js configs, React dependencies).
   - Update `package.json` or replace with platform-native manifest (Cargo.toml, CMakeLists.txt, pom.xml).
5. **Apply Personal Defaults**:
   - Review `.agents/defaults/preferences.yaml` and `docs/design/DESIGN_DEFAULTS.md`.
   - Copy or link default assets (adaptive favicon, tokens) if applicable.
6. **Architecture and Invariants**:
   - Document system topology in `docs/architecture/ARCHITECTURE.md`.
   - Record non-negotiable rules in `docs/architecture/INVARIANTS.md`.
7. **Testing and Evals**:
   - Write initial smoke tests and behavioral evaluations in `tests/evals/`.
8. **Generate Project README**:
   - Replace template README with project-specific `README.md`.
9. **Verify Baseline**:
   - Execute verification: lint, typecheck, header check, test, build.
