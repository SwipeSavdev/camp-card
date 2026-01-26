/**
 * Camp Card Load Testing Scenarios
 *
 * Usage:
 *   export BASE_URL=https://api.campcardapp.org/api/v1
 *   export ADMIN_EMAIL=admin@campcard.org
 *   export ADMIN_PASSWORD=Password123
 *   k6 run scenarios.js
 *
 * Run specific scenario:
 *   k6 run --env SCENARIO=smoke scenarios.js
 *   k6 run --env SCENARIO=load scenarios.js
 *   k6 run --env SCENARIO=stress scenarios.js
 *   k6 run --env SCENARIO=soak scenarios.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Counter, Trend } from "k6/metrics";

// Environment variables
const BASE_URL = __ENV.BASE_URL || "https://api.campcardapp.org/api/v1";
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@campcard.org";
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "Password123";
const TEST_RUN_ID = __ENV.TEST_RUN_ID || `k6-${Date.now()}`;
const SCENARIO = __ENV.SCENARIO || "all";

// Custom metrics
const loginSuccess = new Rate("login_success");
const apiErrors = new Counter("api_errors");
const userCreateTime = new Trend("user_create_time");
const campaignCreateTime = new Trend("campaign_create_time");
const councilReadTime = new Trend("council_read_time");
const merchantReadTime = new Trend("merchant_read_time");

// Test configuration
export const options = {
  scenarios: getScenarios(),
  thresholds: {
    http_req_failed: ["rate<0.01"],              // Error rate < 1%
    http_req_duration: ["p(95)<1500"],            // 95th percentile < 1500ms
    "http_req_duration{endpoint:login}": ["p(95)<500"],
    "http_req_duration{endpoint:users}": ["p(95)<1000"],
    "http_req_duration{endpoint:councils}": ["p(95)<1000"],
    "http_req_duration{endpoint:merchants}": ["p(95)<1000"],
    login_success: ["rate>0.95"],                 // Login success > 95%
  },
};

function getScenarios() {
  const scenarios = {
    // Smoke test - quick validation (1 user, 30 seconds)
    smoke: {
      executor: "constant-vus",
      vus: 1,
      duration: "30s",
      tags: { test_type: "smoke" },
    },

    // Load test - normal traffic (up to 100 users, 16 minutes)
    load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 50 },   // Ramp up
        { duration: "5m", target: 50 },   // Steady state
        { duration: "2m", target: 100 },  // Peak
        { duration: "5m", target: 100 },  // Sustained peak
        { duration: "2m", target: 0 },    // Ramp down
      ],
      tags: { test_type: "load" },
    },

    // Stress test - find breaking point (up to 300 users, 16 minutes)
    stress: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 100 },
        { duration: "5m", target: 200 },
        { duration: "2m", target: 300 },
        { duration: "5m", target: 300 },
        { duration: "2m", target: 0 },
      ],
      tags: { test_type: "stress" },
    },

    // Soak test - sustained load (50 users, 30 minutes)
    soak: {
      executor: "constant-vus",
      vus: 50,
      duration: "30m",
      tags: { test_type: "soak" },
    },

    // Spike test - sudden traffic burst
    spike: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "10s", target: 0 },
        { duration: "10s", target: 200 },  // Spike
        { duration: "1m", target: 200 },   // Hold
        { duration: "10s", target: 0 },    // Drop
        { duration: "2m", target: 0 },     // Recovery
      ],
      tags: { test_type: "spike" },
    },
  };

  // Filter scenarios if specific one requested
  if (SCENARIO !== "all" && scenarios[SCENARIO]) {
    return { [SCENARIO]: scenarios[SCENARIO] };
  }

  // Run smoke only by default for safety
  return { smoke: scenarios.smoke };
}

// Helper function to generate headers
function headers(token, vuId = 0, iter = 0, idempotencyKey = null) {
  const h = {
    "Content-Type": "application/json",
    "X-Test-Run-Id": TEST_RUN_ID,
    "X-Correlation-Id": `${TEST_RUN_ID}-${vuId}-${iter}`,
  };
  if (token) {
    h["Authorization"] = `Bearer ${token}`;
  }
  if (idempotencyKey) {
    h["Idempotency-Key"] = idempotencyKey;
  }
  return h;
}

// Setup-safe headers (no VU context)
function setupHeaders(token = null) {
  const h = {
    "Content-Type": "application/json",
    "X-Test-Run-Id": TEST_RUN_ID,
  };
  if (token) {
    h["Authorization"] = `Bearer ${token}`;
  }
  return h;
}

function uuidLike(vuId = 0) {
  return `${TEST_RUN_ID}-${vuId}-${Math.random().toString(16).slice(2)}`;
}

// ============================================================================
// Authentication
// ============================================================================

function login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD, isSetup = false) {
  const payload = JSON.stringify({ email, password });
  const h = isSetup ? setupHeaders(null) : headers(null, __VU, __ITER);

  const res = http.post(`${BASE_URL}/auth/mobile/login`, payload, {
    headers: h,
    tags: { endpoint: "login" },
  });

  const success = check(res, {
    "login status 200": (r) => r.status === 200,
    "login has token": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.accessToken || body.token;
      } catch (e) {
        return false;
      }
    },
  });

  loginSuccess.add(success);

  if (success) {
    const body = JSON.parse(res.body);
    return body.accessToken || body.token;
  }

  apiErrors.add(1);
  return null;
}

// ============================================================================
// Read Operations
// ============================================================================

function testAuthMe(token) {
  const res = http.get(`${BASE_URL}/auth/me`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "auth_me" },
  });

  check(res, {
    "auth me status 200": (r) => r.status === 200,
    "auth me has user": (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.email && body.role;
      } catch (e) {
        return false;
      }
    },
  });

  return res;
}

function testGetUsers(token) {
  const res = http.get(`${BASE_URL}/users?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "users" },
  });

  check(res, {
    "users list status 200": (r) => r.status === 200,
    "users list has content": (r) => {
      try {
        const body = JSON.parse(r.body);
        return Array.isArray(body.content) || Array.isArray(body);
      } catch (e) {
        return false;
      }
    },
  });

  return res;
}

function testGetCouncils(token) {
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/councils?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "councils" },
  });
  councilReadTime.add(Date.now() - startTime);

  check(res, {
    "councils list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetMerchants(token) {
  const startTime = Date.now();
  const res = http.get(`${BASE_URL}/merchants?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "merchants" },
  });
  merchantReadTime.add(Date.now() - startTime);

  check(res, {
    "merchants list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetOffers(token) {
  const res = http.get(`${BASE_URL}/offers?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "offers" },
  });

  check(res, {
    "offers list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetCampaigns(token) {
  const res = http.get(`${BASE_URL}/campaigns?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "campaigns" },
  });

  check(res, {
    "campaigns list status 200 or 403": (r) => r.status === 200 || r.status === 403,
  });

  return res;
}

function testGetCampCards(token) {
  const res = http.get(`${BASE_URL}/camp-cards?size=20`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "camp_cards" },
  });

  check(res, {
    "camp cards list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetSubscriptionPlans() {
  // Public endpoint - no auth required
  const res = http.get(`${BASE_URL}/subscription-plans`, {
    headers: { "Content-Type": "application/json" },
    tags: { endpoint: "subscription_plans" },
  });

  check(res, {
    "subscription plans status 200": (r) => r.status === 200,
  });

  return res;
}

// ============================================================================
// Write Operations
// ============================================================================

function testCreateUser(token) {
  const email = `loadtest-${uuidLike(__VU)}@test.campcard.org`;
  const idk = `user-${uuidLike(__VU)}`;

  const payload = JSON.stringify({
    email,
    password: "LoadTestPassword123!",
    firstName: "Load",
    lastName: "Test",
    phoneNumber: "555-0000",
    role: "SCOUT",
  });

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/users`, payload, {
    headers: headers(token, __VU, __ITER, idk),
    tags: { endpoint: "users_create" },
  });
  userCreateTime.add(Date.now() - startTime);

  const success = check(res, {
    "user created or forbidden": (r) => r.status === 201 || r.status === 200 || r.status === 403,
  });

  if (!success && res.status !== 403) {
    apiErrors.add(1);
    console.log(`User creation failed: ${res.status} - ${res.body}`);
  }

  return res;
}

function testCreateCampaign(token) {
  const idk = `campaign-${uuidLike(__VU)}`;

  const payload = JSON.stringify({
    name: `Load Test Campaign ${uuidLike(__VU)}`,
    campaignType: "REACTIVATION",
    status: "DRAFT",
    channels: ["EMAIL"],
    targetAudience: { segments: ["all"] },
    contentJson: { message: "Load test campaign content" },
    enableGeofencing: false,
    enableGamification: false,
    enableAiOptimization: false,
  });

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/campaigns`, payload, {
    headers: headers(token, __VU, __ITER, idk),
    tags: { endpoint: "campaigns_create" },
  });
  campaignCreateTime.add(Date.now() - startTime);

  const success = check(res, {
    "campaign created or forbidden": (r) => r.status === 201 || r.status === 200 || r.status === 403,
  });

  if (!success && res.status !== 403) {
    apiErrors.add(1);
  }

  return res;
}

// ============================================================================
// Main Test Function
// ============================================================================

export default function () {
  // Login first
  const token = login();
  if (!token) {
    console.log(`VU ${__VU}: Login failed, skipping iteration`);
    sleep(1);
    return;
  }

  // Run test scenarios
  group("Read Operations", () => {
    testAuthMe(token);
    sleep(0.3);

    testGetUsers(token);
    sleep(0.3);

    testGetCouncils(token);
    sleep(0.3);

    testGetMerchants(token);
    sleep(0.3);

    testGetOffers(token);
    sleep(0.3);

    testGetCampaigns(token);
    sleep(0.3);

    testGetCampCards(token);
    sleep(0.3);

    testGetSubscriptionPlans();
  });

  // Only create resources occasionally (5% of iterations) to avoid data explosion
  if (Math.random() < 0.05) {
    group("Write Operations", () => {
      testCreateUser(token);
      sleep(1);
      testCreateCampaign(token);
    });
  }

  sleep(1);
}

// ============================================================================
// Setup and Teardown
// ============================================================================

export function setup() {
  console.log("=".repeat(60));
  console.log("CAMP CARD LOAD TEST");
  console.log("=".repeat(60));
  console.log(`Test Run ID: ${TEST_RUN_ID}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Scenario: ${SCENARIO}`);
  console.log("=".repeat(60));

  // Verify login works
  const token = login(ADMIN_EMAIL, ADMIN_PASSWORD, true);
  if (!token) {
    throw new Error("Unable to login - aborting test");
  }

  // Verify API connectivity
  const meRes = http.get(`${BASE_URL}/auth/me`, {
    headers: setupHeaders(token),
    tags: { endpoint: "auth_me" },
  });

  if (meRes.status !== 200) {
    console.log(`Warning: Auth/me check returned ${meRes.status}`);
  } else {
    console.log("API connectivity verified successfully");
  }

  return { startTime: Date.now(), testRunId: TEST_RUN_ID };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log("=".repeat(60));
  console.log(`Load test completed in ${duration.toFixed(2)}s`);
  console.log(`Test Run ID: ${data.testRunId}`);
  console.log("=".repeat(60));

  // Note: In production, you might want to add cleanup logic here
  // to delete test users and campaigns created during the test
}

// ============================================================================
// Summary Report
// ============================================================================

export function handleSummary(data) {
  const summary = generateTextSummary(data);
  return {
    stdout: summary,
    [`load-test-report-${TEST_RUN_ID}.json`]: JSON.stringify(data, null, 2),
  };
}

function generateTextSummary(data) {
  const metrics = data.metrics || {};
  const httpReqs = metrics.http_reqs ? metrics.http_reqs.values.count : "N/A";
  const httpFailed = metrics.http_req_failed
    ? metrics.http_req_failed.values.passes
    : "N/A";
  const duration = metrics.http_req_duration
    ? metrics.http_req_duration.values
    : null;

  const lines = [
    "",
    "=".repeat(60),
    "CAMP CARD LOAD TEST SUMMARY",
    "=".repeat(60),
    `Test Run ID: ${TEST_RUN_ID}`,
    `Scenario: ${SCENARIO}`,
    "",
    "REQUESTS",
    `-  Total: ${httpReqs}`,
    `-  Failed: ${httpFailed}`,
    "",
    "RESPONSE TIMES",
    `-  Average: ${duration && duration.avg ? duration.avg.toFixed(2) + "ms" : "N/A"}`,
    `-  P50: ${duration && duration.med ? duration.med.toFixed(2) + "ms" : "N/A"}`,
    `-  P95: ${duration && duration["p(95)"] ? duration["p(95)"].toFixed(2) + "ms" : "N/A"}`,
    `-  P99: ${duration && duration["p(99)"] ? duration["p(99)"].toFixed(2) + "ms" : "N/A"}`,
    "",
    "THRESHOLDS",
    `-  Error Rate < 1%: ${metrics.http_req_failed && metrics.http_req_failed.values.rate < 0.01 ? "PASS" : "FAIL"}`,
    `-  P95 < 1500ms: ${duration && duration["p(95)"] < 1500 ? "PASS" : "FAIL"}`,
    "=".repeat(60),
    "",
  ];

  return lines.join("\n");
}
