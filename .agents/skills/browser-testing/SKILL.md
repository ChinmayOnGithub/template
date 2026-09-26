---
name: browser-testing
description: Drive real browser sessions to navigate, click, fill forms, verify layouts, and inspect console logs.
---

# Browser Testing Skill

Use this workflow to test real interactive flows in live browser instances.

## 1. Automated Browser Loop
1. **Start Dev Server**: Ensure local application is running.
2. **Open Target Route**: Direct browser subagent to target page.
3. **Perform Action Flow**:
   - Fill inputs and click buttons.
   - Assert feedback toasts, dialogs, and optimistic UI updates appear.
4. **Inspect Console & Network**: Verify zero unhandled exceptions or 500 status codes.
5. **Capture Visual Artifact**: Take a screenshot to verify clean presentation.
