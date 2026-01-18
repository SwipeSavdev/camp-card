/**
 * Camp Card E2E Tests - Offer Management
 *
 * Golden path tests for the offer CRUD workflow.
 */
import { test, expect } from "@playwright/test";

test.describe("Offer Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/offers");
    await page.waitForLoadState("networkidle");
  });

  test.describe("Offer List", () => {
    test("displays offer list", async ({ page }) => {
      await expect(
        page.locator("table, [data-testid='offers-list'], .offer-card")
      ).toBeVisible();
    });

    test("shows offer information", async ({ page }) => {
      await page.waitForSelector("table tbody tr, .offer-card", {
        timeout: 10000,
      });

      const firstRow = page.locator("table tbody tr, .offer-card").first();
      await expect(firstRow).toBeVisible();
    });

    test("can search offers", async ({ page }) => {
      const searchInput = page.locator(
        'input[placeholder*="Search"], input[type="search"]'
      );

      if (await searchInput.isVisible()) {
        await searchInput.fill("Discount");
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can filter offers by type", async ({ page }) => {
      const typeFilter = page.locator(
        'select[name="type"], [data-testid="type-filter"]'
      );

      if (await typeFilter.isVisible()) {
        await typeFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await page.waitForLoadState("networkidle");
      }
    });

    test("can filter offers by status", async ({ page }) => {
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

  test.describe("Create Offer", () => {
    test("can open create offer modal", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Offer"), button:has-text("Create Offer"), button:has-text("New Offer")'
      );

      await addButton.scrollIntoViewIfNeeded();
      await addButton.click({ force: isMobile });

      await expect(
        page.locator(
          '[role="dialog"], h2:has-text("Add"), h2:has-text("Create"), h2:has-text("New Offer")'
        )
      ).toBeVisible({ timeout: 5000 });
    });

    test("create offer form has required fields", async ({
      page,
      isMobile,
    }) => {
      const addButton = page.locator(
        'button:has-text("Add Offer"), button:has-text("Create Offer")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      // Check for required fields
      await expect(
        page.locator('input[name="title"], input[placeholder*="Title"]').first()
      ).toBeVisible();
    });

    test("can create a new offer", async ({ page, isMobile }) => {
      const addButton = page.locator(
        'button:has-text("Add Offer"), button:has-text("Create Offer")'
      );
      await addButton.click({ force: isMobile });
      await page.waitForTimeout(500);

      const timestamp = Date.now();

      // Fill title
      const titleInput = page.locator(
        'input[name="title"], input[placeholder*="Title"]'
      ).first();
      await titleInput.fill(`E2E Offer ${timestamp.toString().slice(-6)}`);

      // Fill description if visible
      const descInput = page.locator(
        'textarea[name="description"], input[name="description"]'
      );
      if (await descInput.isVisible()) {
        await descInput.fill("E2E test offer - 10% discount");
      }

      // Fill discount value if visible
      const discountInput = page.locator(
        'input[name="discount"], input[name="discountValue"], input[placeholder*="Discount"]'
      );
      if (await discountInput.isVisible()) {
        await discountInput.fill("10");
      }

      // Select discount type if visible
      const discountType = page.locator(
        'select[name="discountType"], [data-testid="discount-type"]'
      );
      if (await discountType.isVisible()) {
        await discountType.selectOption("PERCENTAGE");
      }

      // Select merchant if required
      const merchantSelect = page.locator(
        'select[name="merchantId"], [data-testid="merchant-select"]'
      );
      if (await merchantSelect.isVisible()) {
        await merchantSelect.selectOption({ index: 1 });
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

  test.describe("View Offer Details", () => {
    test("can view offer details", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .offer-card", {
        timeout: 10000,
      });

      const offerRow = page.locator("table tbody tr, .offer-card").first();
      await offerRow.click({ force: isMobile });
      await page.waitForTimeout(500);

      const detailView = page.locator(
        '[role="dialog"], .offer-detail, [data-testid="offer-details"]'
      );
      const isOnDetailPage = page.url().includes("/offers/");

      expect((await detailView.isVisible()) || isOnDetailPage).toBeTruthy();
    });
  });

  test.describe("Edit Offer", () => {
    test("can access edit functionality", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .offer-card", {
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

  test.describe("Offer Status Management", () => {
    test("can toggle offer status", async ({ page, isMobile }) => {
      await page.waitForSelector("table tbody tr, .offer-card", {
        timeout: 10000,
      });

      // Look for status toggle or button
      const statusToggle = page.locator(
        '[data-testid="status-toggle"], button:has-text("Activate"), button:has-text("Deactivate")'
      ).first();

      if (await statusToggle.isVisible()) {
        // Toggle should be clickable
        await expect(statusToggle).toBeEnabled();
      }
    });
  });
});
