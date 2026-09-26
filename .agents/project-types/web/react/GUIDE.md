# React Guidelines

## 1. State and Lifecycle
- Keep local state close to the component that renders it.
- Use Discriminated Unions for complex component states rather than independent boolean flags.
- Memoize expensive calculations with `useMemo` and stable callbacks with `useCallback` when passed to optimized children.
- Never write raw HTML buttons or unstyled inputs; import canonical design primitives.
