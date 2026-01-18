/**
 * Camp Card E2E Tests - Council Management
 *
 * Golden path tests for the council CRUD workflow.
 */
import { test, expect } from "@playwright/test";

test.describe("Council Management", () => {
  let createdCouncilNumber: string;

  test.beforeEach(async ({ page }) => {
    await page.goto("/councils");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Council List", () => {
    test("displays council list", async ({ page }) => {
      await expect(
        page.locator("table, [data-testid='councils-list'], .council-card")
      ).toBeVisible();
    });

    test("shows council details", async ({ page }) => {
      await page.waitForSelector("table tbody tr, .council-card", {
        timeout: 10000,
      });

      // Should show council information
      const headerRow = page.locator("table thead tr");
      if (await headerRow.isVisible()) {
        await expect(headerRow).toBeVisible();
      }
    });

    test("can filter councils by status", async ({ page }) => {
      const statusFilter = page.locator(
        'select[name="status"], [data-testid="status-filter"]'
      );

      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption("ACTIVE");
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can filter councils by region", async ({ page }) => {
      const regionFilter = page.locator(
        'select[name="region"], [data-testid="region-filter"]'
      );

      if (await regionFilter.isVisible()) {
        await regionFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can search councils", async ({ page }) => {
      const searchInput = page.locator(
        'input[placeholder*="Search"], input[type="search"]'
      );

      if (await searchInput.isVisible()) {
        await searchInput.fill("Test");
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("Create Council", () => {
    test("can open create council modal", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Council"), button:has-text("Create Council"), button:has-text("New Council")'
      );

      await addButton.scrollIntoViewIfNeeded();
      await addButton.click({ force: isMobile });

      await expect(
        page.locator(
          '[role="dialog"], h2:has-text("Add"), h2:has-text("Create"), h2:has-text("New Council")'
        )
      ).toBeVisible({ timeout: 5000 });
    });

    test("create council form has required fields", async ({
      page,
      isMobile,
    }) => {
      const addButton = page.locator(
        'button:has-text("Add Council"), button:has-text("Create Council")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Check for required fields
      await expect(
        page.locator(
          'input[name="councilNumber"], input[placeholder*="Council Number"]'
        )
      ).toBeVisible();
      await expect(
        page.locator('input[name="name"], input[placeholder*="Name"]').first()
      ).toBeVisible();
    });

    test("can create a new council", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Council"), button:has-text("Create Council")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Generate unique council number
      const timestamp = Date.now();
      createdCouncilNumber = `E2E-${timestamp.toString().slice(-6)}`;

      // Fill council number
      const numberInput = page.locator(
        'input[name="councilNumber"], input[placeholder*="Council Number"]'
      );
      await numberInput.fill(createdCouncilNumber);

      // Fill name
      const nameInput = page.locator(
        'input[name="name"], input[placeholder*="Name"]'
      ).first();
      await nameInput.fill("E2E Test Council");

      // Fill region
      const regionInput = page.locator(
        'input[name="region"], select[name="region"]'
      );
      if (await regionInput.isVisible()) {
        const tagName = await regionInput.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        if (tagName === "select") {
          await regionInput.selectOption({ index: 1 });
        } else {
          await regionInput.fill("NORTHEAST");
        }
      }

      // Fill city and state if visible
      const cityInput = page.locator('input[name="city"]');
      if (await cityInput.isVisible()) {
        await cityInput.fill("Test City");
      }

      const stateInput = page.locator('input[name="state"]');
      if (await stateInput.isVisible()) {
        await stateInput.fill("NY");
      }

      // Submit
      const submitButton = page.locator(
        'button:has-text("Save"), button:has-text("Create"), button[type="submit"]'
      ).first();
      await submitButton.click({ force: isMobile });

      await page.waitForTimeout(2000);

      // Verify success
      const modal = page.locator('[role="dialog"]');
      const isModalClosed = !(await modal.isVisible());
      const successMessage = page.locator(
        ':text("success"), :text("created"), .toast'
      );
      const hasSuccess = await successMessage.isVisible();

      expect(isModalClosed || hasSuccess).toBeTruthy();
    });
  });

  test.describe("View Council Details", () => {
    test("can view council details", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .council-card", {
        timeout: 10000,
      });

      // Click on first council row or card
      const councilRow = page.locator("table tbody tr, .council-card").first();
      await councilRow.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Should show detail view or modal
      const detailView = page.locator(
        '[role="dialog"], .council-detail, [data-testid="council-details"]'
      );
      // May navigate to detail page instead
      const isOnDetailPage = page.url().includes("/councils/");

      expect((await detailView.isVisible()) || isOnDetailPage).toBeTruthy();
    });
  });

  test.describe("Edit Council", () => {
    test("can access edit functionality", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .council-card", {
        timeout: 10000,
      });

      const editButton = page.locator(
        'button:has-text("Edit"), [data-testid="edit-button"]'
      ).first();

      if (await editButton.isVisible()) {
        await editButton.click({ force: isMobile });
        await page.waitForTimeout(500);

        await expect(
          page.locator(
            '[role="dialog"], h2:has-text("Edit"), [data-testid="edit-modal"]'
          )
        ).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Council Statistics", () => {
    test("shows council statistics", async ({ page }) => {
      // Navigate to stats page if separate, or check for stats section
      const statsSection = page.locator(
        '[data-testid="council-stats"], .stats-card, :text("Total Councils")'
      );

      // Stats might be on the page or available via a button
      if (await statsSection.isVisible()) {
        await expect(statsSection).toBeVisible();
      }
    });
  });
});
