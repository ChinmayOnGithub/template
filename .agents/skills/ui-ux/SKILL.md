---
name: ui-ux
description: Guide interaction flow, visual hierarchy, feedback loops, and edge case states for intuitive user experience.
---

# UI/UX Skill

Use this workflow to ensure user interfaces are functional, communicative, and pleasant to use.

## The Interaction State Pipeline
Every user flow must account for all 5 essential states:
1. **Initial / Idle State**: Clear affordance, prompt hierarchy, and primary call-to-action.
2. **Loading State**: Non-blocking skeleton loaders or subtle spinner indicators (never blank empty flashes).
3. **Success State**: Clear feedback (toast, affirmative transition, or direct optimistic UI update).
4. **Error State**: Actionable recovery message with a retry trigger.
5. **Empty State**: Explains what belongs here and provides a 1-click creation button.

## Layout Hierarchy Rules
- High-frequency daily actions live in the viewport without scrolling.
- Secondary metadata lives in collapsible drawers or inspector sidebars.
- Dangerous or destructive actions require two-step confirmation (`ConfirmDialog`).
