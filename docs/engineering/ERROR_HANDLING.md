# Error Handling Standards (ERROR_HANDLING.md)

This document establishes the error handling architecture and standards across all layers of the application.

---

## 1. Core Principles

1. **Never Swallow Errors Silently**:
   Never write empty `catch` blocks or `catch (e) { console.log(e); }` without rethrowing or returning an explicit, typed failure result. Every catch block must either recover with a valid fallback, return a typed error, or propagate upward.
2. **Distinguish Expected from Unexpected Errors**:
   - **Expected Errors**: Validation failures, resource not found, unauthenticated access, rate limits. Handle predictably with domain error types and user-facing explanations.
   - **Unexpected Errors**: Uncaught exceptions, database connectivity drop, memory allocation failure. Log with full stack trace and correlation context, and return a sanitized generic error message to clients.
3. **Never Expose Internal Stack Traces to End Users**:
   Database connection strings, SQL statements, and file system paths must never leak into client responses or browser views.
4. **Roll Back Optimistic Updates on Failure**:
   If a client updates UI state optimistically before network confirmation, it must explicitly revert the state if the operation fails.

---

## 2. Error Taxonomy and Classification

| Category | Typical Causes | Handling Strategy | User Response |
| :--- | :--- | :--- | :--- |
| **Validation Error** | Invalid payload, schema failure | Return 400 Bad Request with field-level errors | Highlight specific form fields with actionable guidance |
| **Authentication Error** | Missing or expired token | Reject with 401 Unauthorized; redirect to login | Prompt re-authentication |
| **Authorization Error** | Insufficient permissions, tenant mismatch | Reject with 403 Forbidden; log security event | "You do not have permission to access this resource" |
| **Domain Invariant Error** | Invalid state transition, duplicate record | Throw custom domain error; return typed error code | Clear domain explanation (e.g. "Item already active") |
| **Infrastructure Error** | Database timeout, external API 500 | Retry with exponential backoff if idempotent; log | "Service temporarily unavailable. Please try again." |

---

## 3. Implementation Pattern for Typed Errors

In TypeScript/JavaScript services, prefer returning Discriminated Unions or explicit Result objects over throwing arbitrary exceptions for expected business errors:

```typescript
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E; code?: string };

// Example Domain Operation
export async function executeTransfer(req: TransferRequest): Promise<Result<TransferRecord>> {
  if (req.amount <= 0) {
    return { success: false, error: "Transfer amount must be positive", code: "INVALID_AMOUNT" };
  }
  try {
    const record = await transferService.process(req);
    return { success: true, data: record };
  } catch (err) {
    logger.error("Transfer failed", { error: err, requestId: req.id });
    return { success: false, error: "Internal processing error", code: "INTERNAL_ERROR" };
  }
}
```

---

## 4. UI Error Boundaries and State Fallbacks

1. **React / UI Error Boundaries**:
   Wrap top-level module panels in `<ErrorBoundary>` to isolate crashes and prevent white-screen application failures.
2. **Error View Component**:
   Use the canonical `<ErrorState>` primitive from `design-system/components/ErrorState.tsx` providing an error message and a retry button.
3. **Form Feedback**:
   Display inline validation feedback using `<FormField>` error props rather than generic toast alerts.
