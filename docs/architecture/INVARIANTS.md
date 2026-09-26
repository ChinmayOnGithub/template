# Architectural Invariants

System-wide rules that must never be violated under any circumstances:

1. **INV-01: User Isolation**: Every database read and write must be scoped to the authenticated user ID.
2. **INV-02: Soft Deletion**: Records with lifecycle or audit significance must not be hard deleted. Set `deletedAt`.
3. **INV-03: No Unscoped Batch Writes**: Batch updates or deletes must always supply an explicit filtering `where` clause.
4. **INV-04: UI Non-Blocking**: Local user mutations must reflect optimistically in `<50ms` before remote synchronization completes.
5. **INV-05: Single Source of Truth**: Cached data or derived projections must never overwrite authoritative domain state.
