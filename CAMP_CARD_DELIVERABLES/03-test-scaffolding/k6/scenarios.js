/**
 * Camp Card Load Testing Scenarios
 *
 * Usage:
 *   export BASE_URL=https://bsa.swipesavvy.com/api/v1
 *   export ADMIN_EMAIL=admin@campcard.org
 *   export ADMIN_PASSWORD=Password123
 *   k6 run scenarios.js
 *
 * Run only smoke test:
 *   k6 run --env SCENARIO=smoke scenarios.js
 */

import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate, Counter, Trend } from "k6/metrics";

// Environment variables
const BASE_URL = __ENV.BASE_URL || "https://bsa.swipesavvy.com/api/v1";
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || "admin@campcard.org";
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || "Password123";
const TEST_RUN_ID = __ENV.TEST_RUN_ID || `k6-${Date.now()}`;

// Custom metrics
const loginSuccess = new Rate("login_success");
const apiErrors = new Counter("api_errors");
const userCreateTime = new Trend("user_create_time");
const campaignCreateTime = new Trend("campaign_create_time");

// Test configuration
export const options = {
  scenarios: {
    // Smoke test - quick validation
    smoke: {
      executor: "constant-vus",
      vus: 1,
      duration: "30s",
      tags: { test_type: "smoke" },
    },
    // Load test - normal traffic
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
      startTime: "35s", // Start after smoke test
    },
    // Stress test - find breaking point
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
      startTime: "20m", // Start after load test
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],           // Error rate < 1%
    http_req_duration: ["p(95)<1500"],         // 95th percentile < 1500ms
    "http_req_duration{endpoint:login}": ["p(95)<500"],
    "http_req_duration{endpoint:users}": ["p(95)<1000"],
    login_success: ["rate>0.95"],              // Login success > 95%
  },
};

// Helper function to generate headers
// Note: __VU and __ITER are only available in default() function, not in setup/teardown
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

// Simple headers for setup context (no VU/ITER available)
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

// Login and get JWT token
function login(email = ADMIN_EMAIL, password = ADMIN_PASSWORD, isSetup = false) {
  const payload = JSON.stringify({ email, password });
  const h = isSetup ? setupHeaders(null) : headers(null, __VU, __ITER);

  const res = http.post(`${BASE_URL}/auth/login`, payload, {
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

// API endpoint tests
function testGetUsers(token) {
  const res = http.get(`${BASE_URL}/users?size=100`, {
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

function testCreateUser(token) {
  const email = `test+${uuidLike(__VU)}@loadtest.campcard.org`;
  const idk = `user-${uuidLike(__VU)}`;

  const payload = JSON.stringify({
    email,
    password: "TestPassword123!",
    firstName: "Load",
    lastName: "Test",
    role: "SCOUT",
  });

  const startTime = Date.now();
  const res = http.post(`${BASE_URL}/users`, payload, {
    headers: headers(token, __VU, __ITER, idk),
    tags: { endpoint: "users_create" },
  });
  userCreateTime.add(Date.now() - startTime);

  const success = check(res, {
    "user created": (r) => r.status === 201 || r.status === 200,
  });

  if (!success) {
    apiErrors.add(1);
    console.log(`User creation failed: ${res.status} - ${res.body}`);
  }

  return res;
}

function testGetMerchants(token) {
  const res = http.get(`${BASE_URL}/merchants`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "merchants" },
  });

  check(res, {
    "merchants list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetOffers(token) {
  const res = http.get(`${BASE_URL}/offers`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "offers" },
  });

  check(res, {
    "offers list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetCouncils(token) {
  const res = http.get(`${BASE_URL}/councils`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "councils" },
  });

  check(res, {
    "councils list status 200": (r) => r.status === 200,
  });

  return res;
}

function testGetCampaigns(token) {
  const res = http.get(`${BASE_URL}/campaigns`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "campaigns" },
  });

  check(res, {
    "campaigns list status 200": (r) => r.status === 200,
  });

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

  // Only count as error if it's not a permission issue (403)
  if (!success && res.status !== 403) {
    apiErrors.add(1);
  }

  return res;
}

function testGetCampCards(token) {
  const res = http.get(`${BASE_URL}/camp-cards`, {
    headers: headers(token, __VU, __ITER),
    tags: { endpoint: "camp_cards" },
  });

  check(res, {
    "camp cards list status 200": (r) => r.status === 200,
  });

  return res;
}

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

// Main test function
export default function () {
  // Login first
  const token = login();
  if (!token) {
    console.log("Login failed, skipping iteration");
    sleep(1);
    return;
  }

  // Run test scenarios
  group("Read Operations", () => {
    testAuthMe(token);
    sleep(0.5);
    testGetUsers(token);
    sleep(0.5);
    testGetMerchants(token);
    sleep(0.5);
    testGetOffers(token);
    sleep(0.5);
    testGetCouncils(token);
    sleep(0.5);
    testGetCampaigns(token);
    sleep(0.5);
    testGetCampCards(token);
  });

  // Only create resources occasionally (10% of iterations)
  if (Math.random() < 0.1) {
    group("Write Operations", () => {
      testCreateUser(token);
      sleep(1);
      testCreateCampaign(token);
    });
  }

  sleep(1);
}

// Setup - runs once at start
export function setup() {
  console.log(`Starting load test with TEST_RUN_ID: ${TEST_RUN_ID}`);
  console.log(`Target: ${BASE_URL}`);

  // Verify login works using setup-safe login
  const token = login(ADMIN_EMAIL, ADMIN_PASSWORD, true);
  if (!token) {
    throw new Error("Unable to login - aborting test");
  }

  // Quick API connectivity check using auth/me endpoint
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

// Teardown - runs once at end
export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration}s`);
  console.log(`Test Run ID: ${data.testRunId}`);
  // Note: Add cleanup logic here if needed (delete test users, campaigns, etc.)
}

// Handle test summary
export function handleSummary(data) {
  const summary = generateTextSummary(data);
  return {
    "stdout": summary,
    [`load-test-report-${TEST_RUN_ID}.json`]: JSON.stringify(data, null, 2),
  };
}

function generateTextSummary(data) {
  const metrics = data.metrics || {};
  const httpReqs = metrics.http_reqs ? metrics.http_reqs.values.count : 'N/A';
  const httpFailed = metrics.http_req_failed ? metrics.http_req_failed.values.passes : 'N/A';
  const duration = metrics.http_req_duration ? metrics.http_req_duration.values : null;

  const lines = [
    "=".repeat(60),
    "CAMP CARD LOAD TEST SUMMARY",
    "=".repeat(60),
    `Test Run ID: ${TEST_RUN_ID}`,
    `Total Requests: ${httpReqs}`,
    `Failed Requests: ${httpFailed}`,
    `Avg Response Time: ${duration && duration.avg ? duration.avg.toFixed(2) + 'ms' : 'N/A'}`,
    `P95 Response Time: ${duration && duration["p(95)"] ? duration["p(95)"].toFixed(2) + 'ms' : 'N/A'}`,
    `P99 Response Time: ${duration && duration["p(99)"] ? duration["p(99)"].toFixed(2) + 'ms' : 'N/A'}`,
    "=".repeat(60),
  ];
  return lines.join("\n");
}
