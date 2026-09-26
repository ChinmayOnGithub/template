# Engineering Standards

## 1. Clean Layer Separation
Every mutation and flow must follow strict separation of concerns:
- **Presentation**: Pure components, handles user interaction, zero direct database access.
- **Controller / Action / API Route**: Validates input schema (e.g. Zod), checks authenticated session, returns typed status.
- **Domain Service**: Encapsulates business logic, invariants, state transitions.
- **Storage / Database**: Isolated data access layer with strict parameterization.

## 2. File Header Rule (Mandatory)
Every human-maintained source file where comments are valid must begin with:
```text
/*
 * filename.extension
 * What this file does.
 * Why this file matters.
 */
```
Rules:
1. The filename must be correct.
2. The first line must be the opening comment.
3. Explain what the file does.
4. Explain why the file exists or why it matters.
5. Keep it short.
6. Do not write implementation details that will become stale quickly.
7. Do not write marketing language.
8. Do not use emojis.
9. Do not use em dashes.
10. Do not write unnecessary comments elsewhere.

## 3. Comments Policy
Comments must explain something that is not obvious from the code.
- Write comments for non-obvious decisions, security constraints, external quirks, and intentional tradeoffs.
- Never write comments that simply translate code into English.
- No emojis, no em dashes, no jokes, no promotional fluff.

## 4. Code Quality & Modularity
- Prefer small functions, clear single responsibilities, and explicit interfaces.
- Avoid god components, god services, and deeply nested logic.
- Avoid global mutable state and magic numbers.
- Split files when responsibilities diverge, not solely by arbitrary line limits.
- Apply object-oriented or functional patterns suited to the language. Use appropriate abstractions and keep responsibilities separated.

## 5. TypeScript Standards
- Enable strict typechecking: strict mode, no unchecked indexed access, exact optional properties where appropriate, no implicit override, and no fallthrough cases in switch.
- Never use `as any` or `as unknown` to bypass type checks. Narrow types explicitly.

## 6. Database Safety (Relational)
- Universal soft-delete: Tables storing user history or entities with audit significance must support soft deletion via `deletedAt`.
- Scoped writes: Never execute batch updates or deletes without an explicit where filter.
- Safe migrations: Migrations must be versioned, backward-compatible, and never destructive on existing databases.

## 7. Definition of Done
A task is never complete until:
1. Requirement implemented as specified.
2. Relevant tests pass.
3. Type checking passes with zero errors.
4. Linter and formatter check pass.
5. Build passes.
6. Relevant visual or platform verification passes.
7. Documentation updated if public interfaces or workflows changed.
8. Diff reviewed to verify no unrelated changes or debug code leaked.
