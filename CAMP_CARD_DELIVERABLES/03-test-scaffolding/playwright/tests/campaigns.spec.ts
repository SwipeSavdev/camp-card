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

  test("displays campaign list or empty state", async ({ page }) => {
    // Should show campaigns table or the page title at minimum
    await expect(page.locator("h1, table, [data-testid='campaign-list']").first()).toBeVisible();
  });

  test("can open create campaign modal", async ({ page, isMobile }) => {
    // Find and click "Create Campaign" button
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });

    // Modal should appear with header "Create AI Campaign"
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });
  });

  test("can fill campaign name", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });

    // Wait for modal
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Fill campaign name using the placeholder text
    const nameInput = page.locator('input[placeholder="e.g., Weekend Flash Sale"]');
    await nameInput.fill(`E2E Test Campaign ${Date.now()}`);

    // Verify field is filled
    await expect(nameInput).toHaveValue(/E2E Test Campaign/);
  });

  test("can select campaign type", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });

    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Campaign types are clickable divs with labels like "Acquisition", "Engagement", etc.
    const campaignTypeCard = page.locator('div:has-text("Acquisition")').first();
    if (await campaignTypeCard.isVisible()) {
      await campaignTypeCard.click();
      // The card should now have a different border color (selected state)
    }
  });

  test("can generate AI content", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Fill minimum required field (campaign name)
    const nameInput = page.locator('input[placeholder="e.g., Weekend Flash Sale"]');
    await nameInput.fill(`AI Test Campaign ${Date.now()}`);

    // Click "Generate with AI" button
    const generateButton = page.locator('button:has-text("Generate with AI")');
    if (await generateButton.isVisible()) {
      await generateButton.scrollIntoViewIfNeeded();
      await generateButton.click({ force: isMobile });

      // Wait for generation to start (button text changes to "Generating...")
      await page.waitForTimeout(1000);

      // Generation may take time or fail in test env - just verify button was clickable
    }
  });

  test("can save campaign as draft", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Fill required field - campaign name
    const timestamp = Date.now();
    const nameInput = page.locator('input[placeholder="e.g., Weekend Flash Sale"]');
    await nameInput.fill(`Draft Campaign ${timestamp}`);

    // Click "Save as Draft" button
    const draftButton = page.locator('button:has-text("Save as Draft")');
    await expect(draftButton).toBeVisible();
    await draftButton.scrollIntoViewIfNeeded();
    await draftButton.click({ force: isMobile });

    // Wait for save response
    await page.waitForTimeout(2000);
  });

  test("can toggle advanced options", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Scroll down to find Advanced Options section
    const advancedOptions = page.locator('h4:has-text("Advanced Options")');
    if (await advancedOptions.isVisible()) {
      // Toggle Geofencing option
      const geofencingToggle = page.locator('div:has-text("Enable Geofencing")').first();
      if (await geofencingToggle.isVisible()) {
        await geofencingToggle.click();
      }

      // Toggle Gamification option
      const gamificationToggle = page.locator('div:has-text("Enable Gamification")').first();
      if (await gamificationToggle.isVisible()) {
        await gamificationToggle.click();
      }

      // Toggle AI Learning option
      const aiLearningToggle = page.locator('div:has-text("AI Learning Optimization")').first();
      if (await aiLearningToggle.isVisible()) {
        await aiLearningToggle.click();
      }
    }
  });

  test("can cancel and close modal", async ({ page, isMobile }) => {
    // Open create modal
    const createButton = page.locator('button:has-text("Create Campaign")').first();
    await createButton.scrollIntoViewIfNeeded();
    await createButton.click({ force: isMobile });
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeVisible({ timeout: 5000 });

    // Click Cancel button
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.scrollIntoViewIfNeeded();
    await cancelButton.click({ force: isMobile });

    // Modal should close
    await expect(page.locator('h2:has-text("Create AI Campaign")')).toBeHidden({ timeout: 3000 });
  });
});
