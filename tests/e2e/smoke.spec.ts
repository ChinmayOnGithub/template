/*
 * smoke.spec.ts
 * End-to-end browser smoke test for landing page rendering.
 * Verifies core application availability and page title in browser environment.
 */

import { test, expect } from "@playwright/test";

test.describe("Landing Page Smoke Test", () => {
  test("renders homepage and hero title", async ({ page }) => {
    await page.goto("/");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Universal AI Engineering Workspace");
  });
});
