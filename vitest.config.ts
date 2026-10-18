/*
 * vitest.config.ts
 * Configures Vitest for unit, integration, and evaluation tests.
 * Excludes browser-based end-to-end tests managed by Playwright.
 */

import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["**/node_modules/**", "**/dist/**", "**/tests/e2e/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
