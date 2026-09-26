---
name: accessibility
description: Ensure compliance with WCAG standards, keyboard navigation, focus management, screen readers, and color contrast.
---

# Accessibility (a11y) Skill

Use this checklist whenever creating or revising interactive UI components.

## 1. Keyboard & Focus Management
- **Full Tabability**: Every button, input, link, and interactive widget must be reachable via `Tab`.
- **Visible Focus Indicator**: Focus rings must be high-contrast (`focus-visible:ring-2 focus-visible:ring-primary/60`).
- **Focus Trapping**: Modals and slide-over drawers must trap focus while open and restore focus on close.
- **Escape Key**: All dialogs, menus, and overlays must dismiss on `Escape`.

## 2. Semantic Markup & ARIA
- Use semantic HTML tags (`<nav>`, `<main>`, `<header>`, `<section>`, `<button>`).
- Interactive icons must feature an `aria-label` or `sr-only` description.
- Status badges and live metrics must declare `aria-live="polite"` where relevant.

## 3. Contrast & Legibility
- Body text contrast against dark backgrounds must exceed 4.5:1 ratio (`var(--color-text-main)` or `var(--color-text-muted)`).
- Minimum click/touch target size: 36px desktop, 44px mobile.
