# Architectural Invariants

System-wide rules that must never be violated under any circumstances.

The following baseline invariants apply to interactive data-backed services and applications. During project setup (`project-setup`), adapt or extend these invariants to reflect the specific project type (e.g. backend, CLI, mobile, web, native):

1. **INV-01: Boundary Isolation**: Operations must remain strictly isolated within the authenticated context (e.g. user, tenant, or process sandbox).
2. **INV-02: Non-Destructive Retention**: Entities with audit or historical significance must support non-destructive deletion policies (e.g. `deletedAt`).
3. **INV-03: No Unscoped Batch Writes**: Batch updates or deletes must always supply an explicit filtering condition.
4. **INV-04: Non-Blocking Responsiveness**: Interactive user operations must remain responsive and non-blocking (e.g. UI optimistic updates `<50ms`, CLI non-blocking I/O).
5. **INV-05: Single Source of Truth**: Cached data or derived projections must never overwrite authoritative domain state.
