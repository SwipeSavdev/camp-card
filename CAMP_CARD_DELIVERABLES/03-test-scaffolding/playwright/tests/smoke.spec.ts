/**
 * Camp Card E2E Smoke Tests
 *
 * Quick validation that core features work
 */
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("homepage loads successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Camp Card|BSA/i);
  });

  test("login page is accessible", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test("dashboard loads after login", async ({ page }) => {
    // Auth state is pre-loaded from setup
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("users page loads", async ({ page }) => {
    await page.goto("/users");
    await expect(page).toHaveURL(/users/);
    // Wait for loading to complete
    await page.waitForSelector('[data-testid="users-list"], table, .loading', {
      state: "visible",
      timeout: 10000,
    });
  });

  test("merchants page loads", async ({ page }) => {
    await page.goto("/merchants");
    await expect(page).toHaveURL(/merchants/);
  });

  test("councils page loads", async ({ page }) => {
    await page.goto("/councils");
    await expect(page).toHaveURL(/councils/);
  });

  test("offers page loads", async ({ page }) => {
    await page.goto("/offers");
    await expect(page).toHaveURL(/offers/);
  });

  test("AI marketing page loads", async ({ page }) => {
    await page.goto("/ai-marketing");
    await expect(page).toHaveURL(/ai-marketing/);
  });

  test("camp cards page loads", async ({ page }) => {
    await page.goto("/camp-cards");
    await expect(page).toHaveURL(/camp-cards/);
  });
});
