/**
 * Authentication Setup
 *
 * This file runs before all tests to establish an authenticated session.
 * The auth state is saved and reused by other tests.
 */
import { test as setup, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@campcard.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Password123";
const AUTH_FILE = "playwright/.auth/admin.json";

setup("authenticate as admin", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  // Fill in credentials
  await page.fill('input[type="email"], input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);

  // Click login button
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard or successful login indicator
  await page.waitForURL(/dashboard|\/$/);

  // Verify we're logged in
  await expect(page).not.toHaveURL(/login/);

  // Save authentication state
  await page.context().storageState({ path: AUTH_FILE });
});
