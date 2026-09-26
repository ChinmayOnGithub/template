# Root-Cause Debugging Prompt

Use this prompt when investigating broken behavior, failing tests, or runtime exceptions.

## Task
Trace the failure to its true root cause and apply a minimal, permanent fix.

## Protocol
1. **Reproduce**:
   - Execute the exact command or test that demonstrates the defect.
2. **Observe**:
   - Capture exact stack trace, error message, or log output without guessing.
3. **Trace Pipeline**:
   - Walk the data flow backwards: UI -> Hook/State -> Action/Controller -> Service -> Database/Network.
4. **Identify Root Defect**:
   - Explain why the defect happened. Do not apply superficial surface patches.
5. **Apply Minimal Fix**:
   - Change only what is necessary to resolve the root cause.
6. **Verify and Prevent Regression**:
   - Run tests and add a regression test covering the failure condition.
