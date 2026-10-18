/*
 * playwright.config.ts
 * Configures Playwright end-to-end browser testing.
 * Restricts browser tests to tests/e2e and isolates them from Vitest suites.
 */

import { defineConfig, devices } from "@playwright/test";

const TEST_PORT = process.env.TEST_PORT || "3005";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${TEST_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `npx next start -p ${TEST_PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
