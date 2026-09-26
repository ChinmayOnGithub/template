# Frontend Anti-Patterns to Avoid

- [Avoid] **Neon & Rainbow Gradients**: Avoid multi-color decorative gradients behind cards.
- [Avoid] **Heavy Blurred Shadows**: Avoid `shadow-2xl` glow effects on dark surfaces. Use surface ladder elevation instead.
- [Avoid] **Unstyled Browser Defaults**: Never render raw HTML `<button>`, `<input>`, or `<select>` without design tokens.
- [Avoid] **Ad-hoc Custom Color Classes**: Avoid `bg-zinc-800`, `text-slate-500`. Use CSS variable tokens (`var(--color-bg-surface)`).
- [Avoid] **Missing Loading/Empty States**: Every async query must have a corresponding `<Skeleton>` and `<EmptyState>`.
