/**
 * Camp Card E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 4 : undefined,

  // Reporter to use
  reporter: [
    ["html", { outputFolder: "playwright-report" }],
    ["json", { outputFile: "test-results.json" }],
    ["list"],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: process.env.E2E_BASE_URL || "https://bsa.swipesavvy.com",

    // Collect trace when retrying the failed test
    trace: "on-first-retry",

    // Capture screenshot on failure
    screenshot: "only-on-failure",

    // Record video on failure
    video: "retain-on-failure",

    // Timeout for each action
    actionTimeout: 15000,

    // Timeout for navigation
    navigationTimeout: 30000,
  },

  // Global timeout for each test
  timeout: 60000,

  // Expect timeout
  expect: {
    timeout: 10000,
  },

  // Configure projects for major browsers
  projects: [
    // Setup project for authentication
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use prepared auth state
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },

    // Test against mobile viewports
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        storageState: "playwright/.auth/admin.json",
      },
      dependencies: ["setup"],
    },
  ],

  // Run your local dev server before starting the tests (optional)
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:7020',
  //   reuseExistingServer: !process.env.CI,
  // },
});
