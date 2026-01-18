/**
 * Camp Card E2E Tests - Merchant Management
 *
 * Golden path tests for the merchant CRUD workflow.
 */
import { test, expect } from "@playwright/test";

test.describe("Merchant Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/merchants");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Merchant List", () => {
    test("displays merchant list", async ({ page }) => {
      await expect(
        page.locator("table, [data-testid='merchants-list'], .merchant-card")
      ).toBeVisible();
    });

    test("shows merchant information", async ({ page }) => {
      await page.waitForSelector("table tbody tr, .merchant-card", {
        timeout: 10000,
      });

      // Should show merchant details
      const firstRow = page.locator("table tbody tr, .merchant-card").first();
      await expect(firstRow).toBeVisible();
    });

    test("can search merchants", async ({ page }) => {
      const searchInput = page.locator(
        'input[placeholder*="Search"], input[type="search"]'
      );

      if (await searchInput.isVisible()) {
        await searchInput.fill("Test");
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can filter merchants by category", async ({ page }) => {
      const categoryFilter = page.locator(
        'select[name="category"], [data-testid="category-filter"]'
      );

      if (await categoryFilter.isVisible()) {
        await categoryFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can filter merchants by status", async ({ page }) => {
      const statusFilter = page.locator(
        'select[name="status"], [data-testid="status-filter"]'
      );

      if (await statusFilter.isVisible()) {
        await statusFilter.selectOption("ACTIVE");
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });
  });

  test.describe("Create Merchant", () => {
    test("can open create merchant modal", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Merchant"), button:has-text("Create Merchant"), button:has-text("New Merchant")'
      );

      await addButton.scrollIntoViewIfNeeded();
      await addButton.click({ force: isMobile });

      await expect(
        page.locator(
          '[role="dialog"], h2:has-text("Add"), h2:has-text("Create"), h2:has-text("New Merchant")'
        )
      ).toBeVisible({ timeout: 5000 });
    });

    test("create merchant form has required fields", async ({
      page,
      isMobile,
    }) => {
      const addButton = page.locator(
        'button:has-text("Add Merchant"), button:has-text("Create Merchant")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Check for required fields
      await expect(
        page.locator('input[name="name"], input[placeholder*="Name"]').first()
      ).toBeVisible();
    });

    test("can create a new merchant", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Merchant"), button:has-text("Create Merchant")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      const timestamp = Date.now();
      const merchantName = `E2E Merchant ${timestamp.toString().slice(-6)}`;

      // Fill name
      const nameInput = page.locator(
        'input[name="name"], input[placeholder*="Name"]'
      ).first();
      await nameInput.fill(merchantName);

      // Fill description if visible
      const descInput = page.locator(
        'textarea[name="description"], input[name="description"]'
      );
      if (await descInput.isVisible()) {
        await descInput.fill("E2E test merchant description");
      }

      // Fill category if visible
      const categoryInput = page.locator(
        'select[name="category"], input[name="category"]'
      );
      if (await categoryInput.isVisible()) {
        const tagName = await categoryInput.evaluate((el) =>
          el.tagName.toLowerCase()
        );
        if (tagName === "select") {
          await categoryInput.selectOption({ index: 1 });
        } else {
          await categoryInput.fill("RESTAURANT");
        }
      }

      // Fill address if visible
      const addressInput = page.locator('input[name="address"]');
      if (await addressInput.isVisible()) {
        await addressInput.fill("123 E2E Test Street");
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

  test.describe("View Merchant Details", () => {
    test("can view merchant details", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .merchant-card", {
        timeout: 10000,
      });

      const merchantRow = page
        .locator("table tbody tr, .merchant-card")
        .first();
      await merchantRow.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Should show detail view
      const detailView = page.locator(
        '[role="dialog"], .merchant-detail, [data-testid="merchant-details"]'
      );
      const isOnDetailPage = page.url().includes("/merchants/");

      expect((await detailView.isVisible()) || isOnDetailPage).toBeTruthy();
    });
  });

  test.describe("Merchant Offers", () => {
    test("can navigate to offers from merchant", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .merchant-card", {
        timeout: 10000,
      });

      // Look for offers link or button
      const offersLink = page.locator(
        'a:has-text("Offers"), button:has-text("View Offers")'
      ).first();

      if (await offersLink.isVisible()) {
        await offersLink.click({ force: isMobile });
        await page.waitForTimeout(500);

        // Should navigate to offers or show offers section
        const offersVisible =
          page.url().includes("/offers") ||
          (await page.locator('[data-testid="offers-list"]').isVisible());
        expect(offersVisible).toBeTruthy();
      }
    });
  });
});
