---
name: project-setup
description: Set up a new project or bootstrap an existing codebase into this AI-first workspace template. Surveys manifests, clarifies purpose, selects project-type guidance, applies personal defaults, and establishes the verification baseline.
---

# Project Setup Skill

Adapted from `britt/agent-skills` (`setting-up-a-project`) for this AI-first workspace template.

Use this workflow when setting up a new project or onboarding an existing codebase into this template repository.

## 1. Survey the Repository First
Before asking the user, inspect existing manifests and configuration to detect the project stack:
- Node/TypeScript: `package.json`, lockfiles (`bun.lockb`, `pnpm-lock.yaml`, `package-lock.json`)
- Python: `pyproject.toml`, `requirements.txt`, `uv.lock`
- Rust: `Cargo.toml`
- Go: `go.mod`
- Workflows & CI: `.github/workflows/`

Confirm rather than interrogate: "This appears to be a TypeScript project on bun with Vitest and ESLint. Is that correct?"

## 2. Define Purpose & Scope
1. **Name & Core Mission**: Name of project and one-sentence elevator pitch.
2. **Problem & Users**: Who is this for, and what specific pain point does it solve?
3. **Target Category**: Classify into `.agents/project-types/` (`web`, `backend`, `cli`, `browser-extension`, `developer-extension`, `mobile`, `native`).

## 3. Apply Template Foundations & Defaults
1. **Product Specification**: Record the problem, audience, and scope boundary in `SPEC.md` and `docs/product/`.
2. **Apply Personal Defaults**: Review `.agents/defaults/preferences.yaml` for preferred formatting, typography, and toolchain defaults. If project requirements conflict, project requirements win.
3. **Template Pruning**:
   - If non-web (e.g. CLI, backend, native, extension), remove irrelevant web assets (`design-system/`, Next.js configs) to keep the repository lean.
   - If web, ensure canonical tokens and design system primitives are respected.

## 4. Establish Verification Baseline
1. Verify the project scripts in `package.json` or native manifest:
   - Typecheck: `tsc --noEmit` or platform compiler
   - Lint: `eslint .` or native linter
   - Unit test: `vitest run` or platform test runner
   - Build: `next build`, `cargo build`, or equivalent
2. Run initial verification to confirm the baseline passes with zero errors before writing new features.

## 5. Document Architecture & Invariants
1. Record topology in `docs/architecture/ARCHITECTURE.md`.
2. Define non-negotiable architectural invariants in `docs/architecture/INVARIANTS.md`.
3. Ensure `AGENTS.md` and rules remain aligned.
