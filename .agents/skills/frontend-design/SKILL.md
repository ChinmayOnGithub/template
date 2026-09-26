---
name: frontend-design
description: Create dense, technical, quietly luxurious frontend experiences inspired by Linear, Raycast, and modern design systems.
---

# Frontend Design Skill

Use this skill when building or styling web user interfaces.

## 1. Visual Paradigm
- **Near-Black Canvas**: The page canvas is deep near-black (`#010102` or `var(--color-bg-base)`).
- **Surface Elevation**: Layer cards, dropdowns, and dialogs using surface tokens (`surface-1` through `surface-4`), not heavy fuzzy box shadows.
- **Hairline Borders**: Subdivisions use 1px subtle hairline borders (`var(--color-border)`).
- **Chromatic Accent**: Use a single intentional brand accent (e.g. lavender-blue `#5e6ad2`) exclusively for primary CTAs and active focus rings. Never sprinkle accent colors decoratively.
- **Micro-Interactions**: Interactive elements must feature smooth hover/active scaling (`active:scale-98`, `hover:scale-102`) and transition durations under 150ms.

## 2. Component Composition Rule
- Never write ad-hoc HTML `<button>`, raw text inputs, or arbitrary border cards.
- Always consume canonical primitives from `design-system/components/`.
- Refer to `references/design-principles.md` and `references/anti-patterns.md`.
