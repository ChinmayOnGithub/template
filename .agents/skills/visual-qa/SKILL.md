---
name: visual-qa
description: Systematically audit live rendered pages, screenshot layouts, catch visual bugs, text overflow, and alignment regressions.
---

# Visual QA Skill

Use this workflow to verify rendered UI after changes or before shipping features.

## 1. Visual Inspection Loop
1. **Render Component / Page**: Serve the app locally.
2. **Inspect Viewports**: Test desktop (1440px), tablet (768px), and mobile (375px).
3. **Capture Screenshots**: Verify layout against the design specifications.
4. **Identify Defects**:
   - Unintended horizontal scrollbars or container overflow.
   - Text clipping or ellipsis truncations that hide critical data.
   - Misaligned flex/grid items or uneven padding.
   - Color contrast failure or washed-out muted text.
5. **Fix & Re-verify**: Patch CSS or container bounds, re-inspect visual output.
