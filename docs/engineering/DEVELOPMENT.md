# Development and Contribution Guide

## 1. Local Prerequisites
- Runtime: Node.js 20+ LTS or Bun 1.2+
- Package Manager: Bun or pnpm
- Git: 2.40+

## 2. Setup Instructions
```bash
# 1. Install dependencies
bun install

# 2. Copy environment configuration
cp .env.example .env.local

# 3. Start local development server
bun run dev
```

## 3. Standard Verification Commands
Always verify your changes before submitting PRs or claiming task completion:
```bash
# Run type check
bun run typecheck

# Run linter
bun run lint

# Check formatting
bun run format:check

# Run unit and integration tests
bun run test

# Run build
bun run build
```

## 4. File Header Requirement
Every human-maintained source file must begin with:
```text
/*
 * filename.extension
 * What this file does.
 * Why this file matters.
 */
```
No emojis. No em dashes. Short, professional, and factual.
