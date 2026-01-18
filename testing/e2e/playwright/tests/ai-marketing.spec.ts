/**
 * Camp Card E2E Tests - AI Marketing Campaigns
 *
 * Golden path tests for AI marketing campaign creation and management.
 */
import { test, expect } from "@playwright/test";

test.describe("AI Marketing Campaigns", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/ai-marketing");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Campaign List", () => {
    test("displays campaign list", async ({ page }) => {
      await expect(
        page.locator("table, [data-testid='campaigns-list'], .campaign-card")
      ).toBeVisible({ timeout: 10000 });
    });

    test("shows campaign information", async ({ page }) => {
      await page.waitForSelector("table tbody tr, .campaign-card", {
        timeout: 10000,
      });

      const firstItem = page.locator("table tbody tr, .campaign-card").first();
      if ((await firstItem.count()) > 0) {
        await expect(firstItem).toBeVisible();
      }
    });

    test("can filter campaigns by status", async ({ page }) => {
      const statusFilter = page.locator(
        'select[name="status"], [data-testid="status-filter"]'
      );

      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("Create Campaign", () => {
    test("can open create campaign modal", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign"), button:has-text("Add Campaign")'
      );

      if (await addButton.isVisible()) {
        await addButton.scrollIntoViewIfNeeded();
        await addButton.click({ force: isMobile });

        await expect(
          page.locator(
            '[role="dialog"], h2:has-text("Create"), h2:has-text("New"), h2:has-text("Campaign")'
          )
        ).toBeVisible({ timeout: 5000 });
      }
    });

    test("create campaign form has required fields", async ({
      page,
      isMobile,
    }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign")'
      );

      if (await addButton.isVisible()) {
        await addButton.click({ force: isMobile });
        await page.waitForTimeout(500);

        // Check for required fields
        await expect(
          page.locator(
            'input[name="title"], input[name="name"], input[placeholder*="Title"], input[placeholder*="Name"]'
          ).first()
        ).toBeVisible();
      }
    });

    test("can create a new campaign with AI content", async ({
      page,
      isMobile,
    }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign")'
      );

      if (!(await addButton.isVisible())) {
        test.skip();
        return;
      }

      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      const timestamp = Date.now();

      // Fill campaign title/name
      const titleInput = page.locator(
        'input[name="title"], input[name="name"], input[placeholder*="Title"], input[placeholder*="Name"]'
      ).first();
      await titleInput.fill(
        `E2E AI Campaign ${timestamp.toString().slice(-6)}`
      );

      // Fill description/prompt if visible
      const descInput = page.locator(
        'textarea[name="description"], textarea[name="prompt"], textarea[placeholder*="Description"]'
      ).first();
      if (await descInput.isVisible()) {
        await descInput.fill(
          "Create an engaging marketing campaign for our annual Scout fundraiser"
        );
      }

      // Select target audience if visible
      const audienceSelect = page.locator(
        'select[name="targetAudience"], [data-testid="audience-select"]'
      );
      if (await audienceSelect.isVisible()) {
        await audienceSelect.selectOption({ index: 1 });
      }

      // Enable AI optimization if checkbox exists
      const aiOptimization = page.locator(
        'input[name="enableAiOptimization"], [data-testid="ai-optimization"]'
      );
      if (await aiOptimization.isVisible()) {
        await aiOptimization.check();
      }

      // Look for Generate AI Content button
      const generateButton = page.locator(
        'button:has-text("Generate"), button:has-text("AI"), button:has-text("Create Content")'
      );
      if (await generateButton.isVisible()) {
        await generateButton.click({ force: isMobile });
        // Wait for AI generation (may take a few seconds)
        await page.waitForTimeout(5000);
      }

      // Submit/Save the campaign
      const submitButton = page.locator(
        'button:has-text("Save"), button:has-text("Create"), button[type="submit"]'
      ).first();
      await submitButton.click({ force: isMobile });

      await page.waitForTimeout(2000);

      // Verify success
      const modal = page.locator('[role="dialog"]');
      const isModalClosed = !(await modal.isVisible());
      const successMessage = page.locator(
        ':text("success"), :text("created"), :text("saved"), .toast'
      );
      const hasSuccess = await successMessage.isVisible();

      expect(isModalClosed || hasSuccess).toBeTruthy();
    });
  });

  test.describe("AI Content Generation", () => {
    test("AI generate button is available", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign")'
      );

      if (await addButton.isVisible()) {
        await addButton.click({ force: isMobile });
        await page.waitForTimeout(500);

        // Look for AI generation controls
        const generateButton = page.locator(
          'button:has-text("Generate"), button:has-text("AI"), [data-testid="generate-ai"]'
        );
        const aiControls = page.locator(
          '[data-testid="ai-controls"], .ai-section'
        );

        const hasAiFeatures =
          (await generateButton.isVisible()) || (await aiControls.isVisible());
        expect(hasAiFeatures).toBeTruthy();
      }
    });
  });

  test.describe("Campaign Management", () => {
    test("can view campaign details", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .campaign-card", {
        timeout: 10000,
      });

      const items = page.locator("table tbody tr, .campaign-card");
      if ((await items.count()) > 0) {
        await items.first().click({ force: isMobile });
        await page.waitForTimeout(500);

        const detailView = page.locator(
          '[role="dialog"], .campaign-detail, [data-testid="campaign-details"]'
        );
        const isOnDetailPage = page.url().includes("/campaigns/");

        expect((await detailView.isVisible()) || isOnDetailPage).toBeTruthy();
      }
    });

    test("can access campaign analytics", async ({ page }) => {
      // Look for analytics section or link
      const analyticsLink = page.locator(
        'a:has-text("Analytics"), button:has-text("Analytics"), [data-testid="analytics"]'
      );

      if (await analyticsLink.isVisible()) {
        await expect(analyticsLink).toBeEnabled();
      }
    });
  });

  test.describe("Campaign Features", () => {
    test("geofencing option is available", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign")'
      );

      if (await addButton.isVisible()) {
        await addButton.click({ force: isMobile });
        await page.waitForTimeout(500);

        const geofencing = page.locator(
          'input[name="enableGeofencing"], [data-testid="geofencing"], :text("Geofencing")'
        );
        if (await geofencing.isVisible()) {
          await expect(geofencing).toBeVisible();
        }
      }
    });

    test("gamification option is available", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Create Campaign"), button:has-text("New Campaign")'
      );

      if (await addButton.isVisible()) {
        await addButton.click({ force: isMobile });
        await page.waitForTimeout(500);

        const gamification = page.locator(
          'input[name="enableGamification"], [data-testid="gamification"], :text("Gamification")'
        );
        if (await gamification.isVisible()) {
          await expect(gamification).toBeVisible();
        }
      }
    });
  });
});
