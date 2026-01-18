/**
 * E2E Test Helpers
 *
 * Common utilities for Camp Card E2E tests.
 */
import { Page, expect } from "@playwright/test";

/**
 * Wait for the page to finish loading (network idle + no spinners)
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");

  // Wait for any loading spinners to disappear
  const spinner = page.locator(".loading, .spinner, [data-loading='true']");
  if ((await spinner.count()) > 0) {
    await spinner.waitFor({ state: "hidden", timeout: 10000 });
  }
}

/**
 * Wait for a modal to appear
 */
export async function waitForModal(page: Page) {
  await expect(
    page.locator('[role="dialog"], .modal, [data-testid="modal"]')
  ).toBeVisible({ timeout: 5000 });
}

/**
 * Close any open modal
 */
export async function closeModal(page: Page) {
  const closeButton = page.locator(
    '[role="dialog"] button:has-text("Close"), [role="dialog"] button:has-text("Cancel"), [role="dialog"] [aria-label="Close"]'
  );

  if (await closeButton.isVisible()) {
    await closeButton.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  return {
    email: `e2e-test-${timestamp}@campcard.org`,
    name: `E2E Test ${randomSuffix}`,
    councilNumber: `E2E-${timestamp.toString().slice(-6)}`,
    timestamp,
    randomSuffix,
  };
}

/**
 * Fill a form field if it exists
 */
export async function fillIfVisible(
  page: Page,
  selector: string,
  value: string
) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    await element.fill(value);
    return true;
  }
  return false;
}

/**
 * Select an option if the select element exists
 */
export async function selectIfVisible(
  page: Page,
  selector: string,
  option: string | { index: number }
) {
  const element = page.locator(selector);
  if (await element.isVisible()) {
    await element.selectOption(option);
    return true;
  }
  return false;
}

/**
 * Click a button with force option for mobile
 */
export async function clickButton(
  page: Page,
  selector: string,
  isMobile: boolean = false
) {
  const button = page.locator(selector);
  await button.scrollIntoViewIfNeeded();
  await button.click({ force: isMobile });
}

/**
 * Wait for success indicator (toast, message, or modal close)
 */
export async function waitForSuccess(page: Page) {
  await page.waitForTimeout(1000);

  const successIndicators = [
    page.locator(':text("success")'),
    page.locator(':text("created")'),
    page.locator(':text("saved")'),
    page.locator(':text("updated")'),
    page.locator(".toast-success, .alert-success"),
  ];

  for (const indicator of successIndicators) {
    if (await indicator.isVisible()) {
      return true;
    }
  }

  // Check if modal closed (also counts as success)
  const modal = page.locator('[role="dialog"]');
  if (!(await modal.isVisible())) {
    return true;
  }

  return false;
}

/**
 * Login helper for tests that need fresh auth
 */
export async function login(
  page: Page,
  email: string = "admin@campcard.org",
  password: string = "Password123"
) {
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  await page.fill('input[type="email"], input[name="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  await page.waitForURL(/dashboard|\/$/);
  await expect(page).not.toHaveURL(/login/);
}

/**
 * Logout helper
 */
export async function logout(page: Page) {
  const logoutButton = page.locator(
    'button:has-text("Logout"), button:has-text("Sign Out"), [data-testid="logout"]'
  );

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL(/login/);
  }
}

/**
 * Check if element has specific text
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
  const element = page.locator(`:text("${text}")`);
  return await element.isVisible();
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
}
