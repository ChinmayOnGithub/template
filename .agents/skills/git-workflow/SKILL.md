---
name: git-workflow
description: Enforce disciplined, atomic git practices, clean diffs, descriptive commit messages, and verification before committing.
---

# Git Workflow Skill

Use this workflow to ensure clean version control history and zero accidental rollbacks.

## 1. Commit Discipline Loop
1. **Before Editing**: Check current branch and dirty files with `git status`.
2. **Atomic Changes**: Modify only files directly related to the task. Never casually format or refactor unrelated files.
3. **Verify Before Commit**:
   - `bunx tsc --noEmit`
   - `bun test`
4. **Inspect Diff**: Review `git diff` to ensure no accidental debug logs, comments, or unintended removals exist.
5. **Commit**: Use Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`).
