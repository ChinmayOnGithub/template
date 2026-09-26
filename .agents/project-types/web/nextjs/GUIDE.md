# Next.js Guidelines

## 1. Architecture Rules
- Use App Router (`app/` directory).
- Default to React Server Components (RSC). Only mark components with `"use client"` when state or event listeners are required.
- Server Actions (`app/actions/`): Keep thin. Validate arguments with Zod, authenticate session, call domain service, and return typed results. Never query database directly from Server Actions.
- Server-Only Code: Never import server-only modules (Prisma, database clients, cookies, cryptographic secrets) into client bundles or shared barrel files.

## 2. Bundling and Performance
- Use `next/image` with explicit aspect ratios.
- Avoid large barrel files in client entry points.
- Use dynamic imports (`next/dynamic`) for heavy third-party widgets or editors.
