/**
 * Authentication Setup
 *
 * This file runs before all tests to establish an authenticated session.
 * The auth state is saved and reused by other tests.
 */
import { test as setup, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// Test credentials from CLAUDE.md
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@campcard.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Password123";
const AUTH_FILE = ".auth/admin.json";

setup.describe("Authentication Setup", () => {
  setup("authenticate as admin", async ({ page }) => {
    // Ensure auth directory exists
    const authDir = path.dirname(AUTH_FILE);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Navigate to login page
    await page.goto("/login");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

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

    console.log("Admin authentication state saved to:", AUTH_FILE);
  });
});
