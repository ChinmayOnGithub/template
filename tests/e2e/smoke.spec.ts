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
    await expect(heading).toContainText("Reusable SaaS Starter Kit");
  });

  test("renders health status endpoint", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.status).toBe("ok");
  });

  test("renders login page shell", async ({ page }) => {
    await page.goto("/login");
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("Welcome back");
  });
});
