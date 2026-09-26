---
name: performance-review
description: Profile rendering performance, eliminate unnecessary re-renders, optimize database queries, establish performance budgets, and reduce bundle footprint.
---

# Performance Review Skill

Use this workflow to audit application responsiveness and enforce project performance budgets.

## 1. Frontend Profiling Checklist
- **Eliminate Re-renders**: Wrap heavy child components in `React.memo` or extract isolated subscription hooks.
- **Debounce Rapid Events**: Debounce window resizing, search inputs, and scroll listeners.
- **Dynamic Imports**: Lazy-load heavy modals, syntax highlighters, or charts via `React.lazy` or `dynamic()`.
- **Image Optimization**: Specify explicit dimensions (`width`, `height`) and use modern formats (AVIF/WebP).

## 2. Backend and Query Optimization
- **N+1 Elimination**: Join or batch relational queries rather than querying inside iteration loops.
- **Index Access Patterns**: Assert indexes exist on all columns used in `WHERE`, `JOIN`, or `ORDER BY`.
- **Payload Minimization**: Select only required fields rather than whole database records.

## 3. Performance Budget Audit
- Review `docs/engineering/PERFORMANCE.md` and measure critical user flows against established targets.
