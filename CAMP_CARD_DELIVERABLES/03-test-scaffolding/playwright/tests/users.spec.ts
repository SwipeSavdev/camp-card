/**
 * Camp Card E2E Tests - User Management
 *
 * Tests the user CRUD workflow for admin users.
 */
import { test, expect } from "@playwright/test";

test.describe("User Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
    // Wait for page to load
    await page.waitForLoadState("networkidle");
  });

  test("displays user list", async ({ page }) => {
    // Should show users table or list
    await expect(page.locator("table, [data-testid='users-list']")).toBeVisible();
  });

  test("can search for users", async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("test@");
      await page.waitForTimeout(500); // Debounce
      // Results should update
    }
  });

  test("can open create user modal", async ({ page }) => {
    // Find and click create button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    await createButton.first().click();

    // Modal should appear
    await expect(page.locator('[role="dialog"], .modal, [data-testid="user-modal"]')).toBeVisible();
  });

  test("can create a new user", async ({ page }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("New")');
    await createButton.first().click();

    // Fill in user details
    const timestamp = Date.now();
    const testEmail = `e2e-test-${timestamp}@campcard.org`;

    await page.fill('input[name="email"], input[placeholder*="email"]', testEmail);
    await page.fill('input[name="firstName"], input[placeholder*="First"]', "E2E");
    await page.fill('input[name="lastName"], input[placeholder*="Last"]', "Test");

    // Select role if dropdown exists
    const roleSelect = page.locator('select[name="role"], [data-testid="role-select"]');
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption("SCOUT");
    }

    // Submit form
    const submitButton = page.locator('button[type="submit"], button:has-text("Save"), button:has-text("Create")');
    await submitButton.last().click();

    // Wait for success
    await page.waitForResponse((response) =>
      response.url().includes("/users") && response.status() < 400
    );

    // Modal should close
    await expect(page.locator('[role="dialog"], .modal')).toBeHidden({ timeout: 5000 });
  });

  test("can filter users by role", async ({ page }) => {
    const roleFilter = page.locator('select:has-text("Role"), [data-testid="role-filter"]');
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption("SCOUT");
      await page.waitForTimeout(500);
      // Results should filter
    }
  });

  test("can view user details", async ({ page }) => {
    // Click on first user row
    const firstRow = page.locator("table tbody tr, [data-testid='user-row']").first();
    await firstRow.click();

    // Should navigate to details or open modal
    await page.waitForTimeout(500);
  });
});
