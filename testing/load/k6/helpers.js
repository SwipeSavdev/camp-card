/**
 * Camp Card Load Testing Helpers
 *
 * Reusable utilities for k6 load tests.
 */

import { check } from "k6";
import http from "k6/http";

// Environment variables with defaults
export const CONFIG = {
  BASE_URL: __ENV.BASE_URL || "https://bsa.swipesavvy.com/api/v1",
  ADMIN_EMAIL: __ENV.ADMIN_EMAIL || "admin@campcard.org",
  ADMIN_PASSWORD: __ENV.ADMIN_PASSWORD || "Password123",
  TEST_RUN_ID: __ENV.TEST_RUN_ID || `k6-${Date.now()}`,
};

/**
 * Generate request headers with optional authentication
 */
export function getHeaders(token = null, idempotencyKey = null) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Test-Run-Id": CONFIG.TEST_RUN_ID,
    "X-Correlation-Id": `${CONFIG.TEST_RUN_ID}-${__VU}-${__ITER}`,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  return headers;
}

/**
 * Generate unique identifier for test data
 */
export function generateUniqueId(prefix = "test") {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${__VU}-${timestamp}-${random}`;
}

/**
 * Generate unique email for test users
 */
export function generateTestEmail(prefix = "loadtest") {
  return `${prefix}-${generateUniqueId()}@test.campcard.org`;
}

/**
 * Parse JSON response safely
 */
export function parseResponse(response) {
  try {
    return JSON.parse(response.body);
  } catch (e) {
    return null;
  }
}

/**
 * Check if response is successful (2xx status)
 */
export function isSuccess(response) {
  return response.status >= 200 && response.status < 300;
}

/**
 * Check if response is client error (4xx status)
 */
export function isClientError(response) {
  return response.status >= 400 && response.status < 500;
}

/**
 * Check if response is server error (5xx status)
 */
export function isServerError(response) {
  return response.status >= 500;
}

/**
 * Standard response checks
 */
export function checkResponse(response, name, expectedStatus = 200) {
  return check(response, {
    [`${name} status ${expectedStatus}`]: (r) => r.status === expectedStatus,
    [`${name} has body`]: (r) => r.body && r.body.length > 0,
    [`${name} is valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
  });
}

/**
 * Check paginated response
 */
export function checkPaginatedResponse(response, name) {
  return check(response, {
    [`${name} status 200`]: (r) => r.status === 200,
    [`${name} has content array`]: (r) => {
      const body = parseResponse(r);
      return body && (Array.isArray(body.content) || Array.isArray(body));
    },
    [`${name} has pagination info`]: (r) => {
      const body = parseResponse(r);
      return body && (body.totalElements !== undefined || body.length !== undefined);
    },
  });
}

/**
 * Create authenticated HTTP client
 */
export function createAuthenticatedClient(token) {
  return {
    get: (url, options = {}) => {
      return http.get(`${CONFIG.BASE_URL}${url}`, {
        ...options,
        headers: { ...getHeaders(token), ...(options.headers || {}) },
      });
    },

    post: (url, body, options = {}) => {
      return http.post(`${CONFIG.BASE_URL}${url}`, JSON.stringify(body), {
        ...options,
        headers: { ...getHeaders(token), ...(options.headers || {}) },
      });
    },

    put: (url, body, options = {}) => {
      return http.put(`${CONFIG.BASE_URL}${url}`, JSON.stringify(body), {
        ...options,
        headers: { ...getHeaders(token), ...(options.headers || {}) },
      });
    },

    del: (url, options = {}) => {
      return http.del(`${CONFIG.BASE_URL}${url}`, null, {
        ...options,
        headers: { ...getHeaders(token), ...(options.headers || {}) },
      });
    },
  };
}

/**
 * Test data generators
 */
export const TestData = {
  user: () => ({
    email: generateTestEmail("user"),
    password: "TestPassword123!",
    firstName: "Load",
    lastName: "Test",
    phoneNumber: `555-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`,
    role: "SCOUT",
  }),

  council: () => ({
    councilNumber: `LT-${generateUniqueId("C").substring(0, 8)}`,
    name: `Load Test Council ${Date.now()}`,
    region: "NORTHEAST",
    city: "Test City",
    state: "NY",
    status: "ACTIVE",
  }),

  merchant: () => ({
    name: `Load Test Merchant ${Date.now()}`,
    description: "Created by load test",
    category: "RESTAURANT",
    status: "ACTIVE",
  }),

  offer: () => ({
    title: `Load Test Offer ${Date.now()}`,
    description: "10% discount for load test",
    discountType: "PERCENTAGE",
    discountValue: 10,
    status: "ACTIVE",
  }),

  campaign: () => ({
    name: `Load Test Campaign ${Date.now()}`,
    campaignType: "REACTIVATION",
    status: "DRAFT",
    channels: ["EMAIL"],
    targetAudience: { segments: ["all"] },
    contentJson: { message: "Load test campaign content" },
    enableGeofencing: false,
    enableGamification: false,
    enableAiOptimization: false,
  }),
};

/**
 * SLA thresholds
 */
export const SLA = {
  // Response time targets (milliseconds)
  LOGIN_P95: 500,
  READ_P95: 1000,
  WRITE_P95: 1500,
  OVERALL_P95: 1500,

  // Error rate targets
  ERROR_RATE: 0.01, // 1%

  // Throughput targets
  MIN_RPS: 10, // Minimum requests per second

  // Availability
  SUCCESS_RATE: 0.95, // 95%
};

/**
 * Common endpoint paths
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    MOBILE_LOGIN: "/auth/mobile/login",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
  },
  USERS: "/users",
  COUNCILS: "/councils",
  MERCHANTS: "/merchants",
  OFFERS: "/offers",
  CAMPAIGNS: "/campaigns",
  CAMP_CARDS: "/camp-cards",
  SUBSCRIPTION_PLANS: "/subscription-plans",
};
