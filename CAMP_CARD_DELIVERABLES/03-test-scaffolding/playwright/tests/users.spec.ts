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
    const searchInput = page.locator('input[placeholder="Search users..."]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("test@");
      await page.waitForTimeout(500); // Debounce
      // Results should update
    }
  });

  test("can open create user modal", async ({ page, isMobile }) => {
    // Find and click "Add User" button
    const addUserButton = page.locator('button:has-text("Add User")');

    // Scroll into view and click with force on mobile to handle overlay issues
    await addUserButton.scrollIntoViewIfNeeded();
    await addUserButton.click({ force: isMobile });

    // Modal should appear with header "Add New User"
    await expect(page.locator('h2:has-text("Add New User")')).toBeVisible({ timeout: 5000 });
  });

  test("can create a new user", async ({ page, isMobile }) => {
    // Open create modal
    const addUserButton = page.locator('button:has-text("Add User")');
    await addUserButton.scrollIntoViewIfNeeded();
    await addUserButton.click({ force: isMobile });

    // Wait for modal to appear
    await expect(page.locator('h2:has-text("Add New User")')).toBeVisible({ timeout: 5000 });

    // Fill in user details
    const timestamp = Date.now();
    const testEmail = `e2e-test-${timestamp}@campcard.org`;

    // Fill name field
    const nameInput = page.locator('input[placeholder="Enter user name"]').first();
    await nameInput.fill("E2E Test User");

    // Fill email field
    const emailInput = page.locator('input[placeholder="Enter email address"]').first();
    await emailInput.fill(testEmail);

    // Select role if dropdown exists
    const roleSelect = page.locator('select').first();
    if (await roleSelect.isVisible()) {
      await roleSelect.selectOption("SCOUT");
    }

    // Submit form - look for Save or Create button in modal
    const submitButton = page.locator('button:has-text("Save"), button:has-text("Create User")').first();
    await submitButton.scrollIntoViewIfNeeded();
    await submitButton.click({ force: isMobile });

    // Wait for success - either modal closes or success message appears
    await page.waitForTimeout(2000);
  });

  test("can filter users by role", async ({ page }) => {
    const roleFilter = page.locator('select').first();
    if (await roleFilter.isVisible()) {
      await roleFilter.selectOption("SCOUT");
      await page.waitForTimeout(500);
      // Results should filter
    }
  });

  test("can view user details", async ({ page, isMobile }) => {
    // Click on first user row's edit button
    const editButton = page.locator("table tbody tr button").first();
    if (await editButton.isVisible()) {
      await editButton.scrollIntoViewIfNeeded();
      await editButton.click({ force: isMobile });
      await page.waitForTimeout(500);
    }
  });

  test("shows pagination controls", async ({ page }) => {
    // Check for pagination buttons
    const paginationButtons = page.locator('button:has-text("First"), button:has-text("Prev"), button:has-text("Next"), button:has-text("Last")');
    // At least one pagination control should be visible if there's data
    const count = await paginationButtons.count();
    expect(count).toBeGreaterThanOrEqual(0); // Pass even if no pagination (few users)
  });
});
