/**
 * Camp Card E2E Smoke Tests
 *
 * Quick validation that core features and pages load successfully.
 * These tests run first to catch obvious deployment issues.
 */
import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test.describe("Public Pages", () => {
    test("homepage loads successfully", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveTitle(/Camp Card|BSA/i);
    });

    test("login page is accessible", async ({ page }) => {
      await page.goto("/login");
      await expect(
        page.locator('input[type="email"], input[name="email"]')
      ).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
  });

  test.describe("Authenticated Pages", () => {
    test("dashboard loads after login", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page).toHaveURL(/dashboard/);
      // Should see some dashboard content
      await page.waitForLoadState("networkidle");
    });

    test("users page loads", async ({ page }) => {
      await page.goto("/users");
      await expect(page).toHaveURL(/users/);
      // Wait for either user list or loading state
      await page.waitForSelector('[data-testid="users-list"], table, .loading', {
        state: "visible",
        timeout: 10000,
      });
    });

    test("councils page loads", async ({ page }) => {
      await page.goto("/councils");
      await expect(page).toHaveURL(/councils/);
      await page.waitForLoadState("networkidle");
    });

    test("merchants page loads", async ({ page }) => {
      await page.goto("/merchants");
      await expect(page).toHaveURL(/merchants/);
      await page.waitForLoadState("networkidle");
    });

    test("offers page loads", async ({ page }) => {
      await page.goto("/offers");
      await expect(page).toHaveURL(/offers/);
      await page.waitForLoadState("networkidle");
    });

    test("AI marketing page loads", async ({ page }) => {
      await page.goto("/ai-marketing");
      await expect(page).toHaveURL(/ai-marketing/);
      await page.waitForLoadState("networkidle");
    });

    test("camp cards page loads", async ({ page }) => {
      await page.goto("/camp-cards");
      await expect(page).toHaveURL(/camp-cards/);
      await page.waitForLoadState("networkidle");
    });

    test("profile page loads", async ({ page }) => {
      await page.goto("/profile");
      await expect(page).toHaveURL(/profile/);
      await page.waitForLoadState("networkidle");
    });
  });

  test.describe("Navigation", () => {
    test("main navigation is accessible", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Check for nav links
      const navLinks = page.locator("nav a, aside a");
      const count = await navLinks.count();
      expect(count).toBeGreaterThan(0);
    });

    test("can navigate between pages", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Navigate to users
      await page.goto("/users");
      await expect(page).toHaveURL(/users/);

      // Navigate to councils
      await page.goto("/councils");
      await expect(page).toHaveURL(/councils/);
    });
  });

  test.describe("Accessibility", () => {
    test("pages have proper heading structure", async ({ page }) => {
      await page.goto("/dashboard");
      await page.waitForLoadState("networkidle");

      // Should have at least one heading
      const headings = page.locator("h1, h2");
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });

    test("form inputs have labels or placeholders", async ({ page }) => {
      await page.goto("/login");

      const emailInput = page.locator('input[type="email"]');
      const emailLabel = await emailInput.getAttribute("aria-label");
      const emailPlaceholder = await emailInput.getAttribute("placeholder");

      // Should have some accessible name
      expect(emailLabel || emailPlaceholder).toBeTruthy();
    });
  });
});
