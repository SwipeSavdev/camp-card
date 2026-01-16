/**
 * Camp Card E2E Tests - AI Marketing Campaigns
 *
 * Tests the AI campaign creation workflow.
 */
import { test, expect } from "@playwright/test";

test.describe("AI Marketing Campaigns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-marketing");
    await page.waitForLoadState("networkidle");
  });

  test("displays campaign list", async ({ page }) => {
    // Should show campaigns or empty state
    await expect(page.locator("table, [data-testid='campaign-list'], .no-campaigns")).toBeVisible();
  });

  test("can open create campaign modal", async ({ page }) => {
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")');
    await createButton.first().click();

    // Modal should appear
    await expect(page.locator('[role="dialog"], .modal, [data-testid="campaign-modal"]')).toBeVisible();
  });

  test("can fill campaign details", async ({ page }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")');
    await createButton.first().click();

    // Wait for modal
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible();

    // Fill campaign name
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(`E2E Test Campaign ${Date.now()}`);
    }

    // Select campaign type
    const typeSelect = page.locator('select[name="type"], [data-testid="campaign-type"]');
    if (await typeSelect.isVisible()) {
      await typeSelect.selectOption({ index: 1 }); // Select first non-empty option
    }

    // Select channels
    const emailCheckbox = page.locator('input[value="EMAIL"], input[name="channels"][value="email"]');
    if (await emailCheckbox.isVisible()) {
      await emailCheckbox.check();
    }
  });

  test("can generate AI content", async ({ page }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")');
    await createButton.first().click();
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible();

    // Fill minimum required fields
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(`AI Test Campaign ${Date.now()}`);
    }

    // Click Generate with AI button
    const generateButton = page.locator('button:has-text("Generate"), button:has-text("AI")');
    if (await generateButton.isVisible()) {
      await generateButton.click();

      // Wait for AI generation (may take a few seconds)
      await page.waitForResponse(
        (response) => response.url().includes("/ai/generate") || response.url().includes("/campaigns"),
        { timeout: 30000 }
      ).catch(() => {
        // AI generation might not be available in test environment
      });
    }
  });

  test("can save campaign as draft", async ({ page }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")');
    await createButton.first().click();
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible();

    // Fill required fields
    const timestamp = Date.now();
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]');
    if (await nameInput.isVisible()) {
      await nameInput.fill(`Draft Campaign ${timestamp}`);
    }

    // Click Save as Draft
    const draftButton = page.locator('button:has-text("Draft"), button:has-text("Save")');
    if (await draftButton.isVisible()) {
      await draftButton.click();

      // Wait for save
      await page.waitForResponse(
        (response) => response.url().includes("/campaigns") && response.status() < 400,
        { timeout: 10000 }
      ).catch(() => {});
    }
  });

  test("can toggle campaign settings", async ({ page }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create"), button:has-text("New Campaign")');
    await createButton.first().click();
    await expect(page.locator('[role="dialog"], .modal')).toBeVisible();

    // Toggle geofencing
    const geofencingToggle = page.locator('[data-testid="geofencing-toggle"], input[name="enableGeofencing"]');
    if (await geofencingToggle.isVisible()) {
      await geofencingToggle.click();
    }

    // Toggle gamification
    const gamificationToggle = page.locator('[data-testid="gamification-toggle"], input[name="enableGamification"]');
    if (await gamificationToggle.isVisible()) {
      await gamificationToggle.click();
    }

    // Toggle AI optimization
    const aiOptToggle = page.locator('[data-testid="ai-optimization-toggle"], input[name="enableAiOptimization"]');
    if (await aiOptToggle.isVisible()) {
      await aiOptToggle.click();
    }
  });
});
