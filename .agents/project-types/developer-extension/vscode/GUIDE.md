# VS Code Extension Guidelines

- Use TypeScript with strict null checks.
- Dispose all subscriptions, commands, and providers in `context.subscriptions.push(...)`.
- Use `vscode.workspace.getConfiguration` with typed schemas defined in `package.json`.
- Keep language server protocols separated from client extension logic.
