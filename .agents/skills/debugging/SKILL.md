---
name: debugging
description: Systematic root-cause debugging workflow preventing random patch loops and speculative edits.
---

# Debugging Skill

Use this workflow whenever troubleshooting test failures, runtime errors, or unexpected system behavior.

## 1. The 7-Step Root-Cause Protocol
1. **Reproduce**: Run the exact command or recreate the exact user sequence triggering the failure.
2. **Observe**: Capture raw error traces, network codes, or terminal stack outputs without guessing.
3. **Hypothesize**: Formulate a single testable thesis for why the failure occurs.
4. **Inspect Evidence**: Trace the pipeline backwards:
   `Rendered Component` -> `Store / Hook` -> `Action / API` -> `Domain Service` -> `DB / Network`.
5. **Identify Root Cause**: Locate the single defect causing the discrepancy.
6. **Patch Minimally**: Apply the cleanest, smallest fix addressing the root cause.
7. **Regression Test**: Run automated tests to prove the bug is resolved without breaking existing features.
