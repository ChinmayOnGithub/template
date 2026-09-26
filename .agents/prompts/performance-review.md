# Performance Review Prompt

Use this prompt to identify and eliminate latency bottlenecks, query bloat, or excessive rendering.

## Task
Audit rendering patterns, network payloads, database access, and memory efficiency.

## Analysis Checklist
1. **Frontend Rendering**:
   - Unnecessary parent re-renders, lack of memoization on expensive subtrees.
   - Heavy un-split dependencies in initial bundle.
2. **Backend and Database**:
   - N+1 query patterns inside loops.
   - Missing indexes on filter or join columns.
   - Excessive payloads (selecting entire tables instead of projected fields).
3. **Network**:
   - Lack of caching headers on static or invariant read queries.
