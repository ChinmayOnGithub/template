# Context Index and Retrieval

The context layer keeps repository knowledge outside the active model context until it is needed.

## Flow

```
task
  -> task signals
  -> indexed items
  -> deterministic ranking
  -> token budget
  -> cached summaries
  -> exact source ranges when needed
```

## Files

- `schema.json`: ContextItem contract.
- `index.json`: generated repository structure and symbol index.
- `items.json`: generated compact knowledge cache.
- `.agents/scripts/context-index.mjs`: rebuilds the index and cache.
- `.agents/scripts/context-build.mjs`: builds task-specific context.
- `.agents/scripts/audit-context.mjs`: reports context and cache metrics.

Run:

```bash
npm run context:index
npm run context:build -- --task="implement authentication"
npm run audit-context
```

The index and cache are generated artifacts. The repository remains the source of truth. Cached items contain summaries and pointers, not replacement source code.
