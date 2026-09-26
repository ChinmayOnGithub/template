# Developer Extension Standards

## 1. Overview
Applies to extensions for IDEs and developer workflows, including VS Code, JetBrains, and CLI plugins.

## 2. Core Architectural Constraints
- Process Isolation: Extensions run in a dedicated extension host process. Never block the main thread.
- Activation Events: Lazy-activate only on explicit commands, document selectors, or view openings (`onCommand:`, `onLanguage:`).
- Webview Performance: Treat Webviews as separate browser sandboxes; use structured message passing.
- Compatibility: Target supported minimum engine versions without forcing breaking updates on users.

## 3. Sub-Platform References
- See `vscode/GUIDE.md` for VS Code API patterns, telemetry rules, and contribution points.
