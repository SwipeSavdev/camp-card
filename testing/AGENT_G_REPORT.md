# Agent G Report: Load & Peak Engineer

**Project:** Camp Card Fundraising Platform
**Agent:** Agent G - Load & Peak Engineer
**Date:** January 2026
**Status:** Complete

## Executive Summary

Created comprehensive k6 load testing suite with multiple scenarios (smoke, load, stress, soak, spike) to validate API performance under various traffic patterns. Tests include SLA thresholds, custom metrics, and CI/CD integration support.

## Infrastructure Created

### 1. Main Test Scenarios

**Location:** `testing/load/k6/scenarios.js`

| Scenario | VUs | Duration | Purpose |
|----------|-----|----------|---------|
| Smoke | 1 | 30s | Quick validation |
| Load | 0 → 50 → 100 → 0 | ~16min | Normal traffic |
| Stress | 0 → 100 → 200 → 300 → 0 | ~16min | Breaking point |
| Soak | 50 constant | 30min | Resource leaks |
| Spike | 0 → 200 instant → 0 | ~3min | Burst handling |

### 2. Helper Functions

**Location:** `testing/load/k6/helpers.js`

| Helper | Purpose |
|--------|---------|
| `getHeaders()` | Generate request headers with auth |
| `generateUniqueId()` | Create unique test identifiers |
| `generateTestEmail()` | Create test user emails |
| `parseResponse()` | Safe JSON parsing |
| `checkResponse()` | Standard response validation |
| `checkPaginatedResponse()` | Paginated response validation |
| `createAuthenticatedClient()` | HTTP client factory |
| `TestData` | Test data generators |

## SLA Thresholds

| Metric | Threshold | Description |
|--------|-----------|-------------|
| `http_req_failed` | < 1% | Error rate |
| `http_req_duration` | P95 < 1500ms | Overall latency |
| `http_req_duration{endpoint:login}` | P95 < 500ms | Auth latency |
| `http_req_duration{endpoint:users}` | P95 < 1000ms | Users API |
| `http_req_duration{endpoint:councils}` | P95 < 1000ms | Councils API |
| `http_req_duration{endpoint:merchants}` | P95 < 1000ms | Merchants API |
| `login_success` | > 95% | Login success rate |

## Custom Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `login_success` | Rate | Percentage of successful logins |
| `api_errors` | Counter | Total API error count |
| `user_create_time` | Trend | User creation latency distribution |
| `campaign_create_time` | Trend | Campaign creation latency |
| `council_read_time` | Trend | Council list latency |
| `merchant_read_time` | Trend | Merchant list latency |

## Endpoints Tested

### Read Operations (95% of traffic)

| Endpoint | Auth | Tags |
|----------|------|------|
| `GET /auth/me` | Yes | `auth_me` |
| `GET /users?size=20` | Yes | `users` |
| `GET /councils?size=20` | Yes | `councils` |
| `GET /merchants?size=20` | Yes | `merchants` |
| `GET /offers?size=20` | Yes | `offers` |
| `GET /campaigns?size=20` | Yes | `campaigns` |
| `GET /camp-cards?size=20` | Yes | `camp_cards` |
| `GET /subscription-plans` | No | `subscription_plans` |

### Write Operations (5% of traffic)

| Endpoint | Auth | Tags | Notes |
|----------|------|------|-------|
| `POST /users` | Yes | `users_create` | Idempotency key |
| `POST /campaigns` | Yes | `campaigns_create` | Idempotency key |

## Test Commands

```bash
# Navigate to test directory
cd testing/load/k6

# Run smoke test (default)
k6 run scenarios.js

# Run specific scenarios
k6 run --env SCENARIO=smoke scenarios.js
k6 run --env SCENARIO=load scenarios.js
k6 run --env SCENARIO=stress scenarios.js
k6 run --env SCENARIO=soak scenarios.js
k6 run --env SCENARIO=spike scenarios.js

# Custom base URL
k6 run --env BASE_URL=http://localhost:7010/api/v1 scenarios.js

# Custom credentials
k6 run --env ADMIN_EMAIL=test@test.com --env ADMIN_PASSWORD=Test123 scenarios.js

# Output to JSON
k6 run --out json=results.json scenarios.js

# With InfluxDB (for Grafana dashboards)
k6 run --out influxdb=http://localhost:8086/k6 scenarios.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://bsa.swipesavvy.com/api/v1` | API base URL |
| `ADMIN_EMAIL` | `admin@campcard.org` | Admin login email |
| `ADMIN_PASSWORD` | `Password123` | Admin login password |
| `SCENARIO` | `smoke` | Test scenario to run |
| `TEST_RUN_ID` | Auto-generated | Unique test run identifier |

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| scenarios.js | 395 | Main test scenarios |
| helpers.js | 220 | Reusable test utilities |
| README.md | 220 | Documentation |
| **Total** | **~835** | |

## Test Flow

```
1. Setup Phase
   ├── Verify admin login
   ├── Verify API connectivity
   └── Log test configuration

2. Iteration Phase (per VU)
   ├── Login (get JWT token)
   ├── Read Operations Group (95%)
   │   ├── GET /auth/me
   │   ├── GET /users
   │   ├── GET /councils
   │   ├── GET /merchants
   │   ├── GET /offers
   │   ├── GET /campaigns
   │   ├── GET /camp-cards
   │   └── GET /subscription-plans
   └── Write Operations Group (5%)
       ├── POST /users (with idempotency key)
       └── POST /campaigns (with idempotency key)

3. Teardown Phase
   ├── Log completion time
   └── Generate summary report
```

## Idempotency Support

All write operations include idempotency keys:
- Header: `Idempotency-Key: {operation}-{TEST_RUN_ID}-{VU}-{random}`
- Prevents duplicate resource creation on retries
- Supports at-least-once delivery semantics

## Correlation Headers

All requests include:
- `X-Test-Run-Id`: Unique test run identifier
- `X-Correlation-Id`: `{TEST_RUN_ID}-{VU}-{ITER}`

These headers enable:
- Backend log correlation
- Test traffic identification
- Easy cleanup of test data

## Output Formats

### Console Summary
```
============================================================
CAMP CARD LOAD TEST SUMMARY
============================================================
Test Run ID: k6-1705456789
Scenario: load

REQUESTS
-  Total: 15,234
-  Failed: 12

RESPONSE TIMES
-  Average: 245.32ms
-  P50: 198.45ms
-  P95: 512.67ms
-  P99: 892.34ms

THRESHOLDS
-  Error Rate < 1%: PASS
-  P95 < 1500ms: PASS
============================================================
```

### JSON Report
- File: `load-test-report-{TEST_RUN_ID}.json`
- Contains full metrics, checks, and threshold results

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run k6 Load Test
  uses: grafana/k6-action@v0.3.1
  with:
    filename: testing/load/k6/scenarios.js
  env:
    BASE_URL: ${{ secrets.API_URL }}
    ADMIN_EMAIL: ${{ secrets.LOAD_TEST_EMAIL }}
    ADMIN_PASSWORD: ${{ secrets.LOAD_TEST_PASSWORD }}
    SCENARIO: smoke

- name: Upload k6 Results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: k6-results
    path: load-test-report-*.json
```

### Docker

```bash
docker run --rm -i \
  -e BASE_URL=https://bsa.swipesavvy.com/api/v1 \
  -e SCENARIO=load \
  grafana/k6 run - < scenarios.js
```

## Grafana Dashboard

For real-time monitoring, output to InfluxDB:

```bash
k6 run --out influxdb=http://localhost:8086/k6 scenarios.js
```

Then import k6 dashboard (ID: 2587) in Grafana.

## Recommendations

1. **Baseline Metrics**: Run smoke test regularly to establish baseline
2. **Pre-Deploy Testing**: Run load test before each production deploy
3. **Capacity Planning**: Use stress test results for scaling decisions
4. **Memory Leaks**: Schedule monthly soak tests
5. **Auto-Scaling**: Validate with spike tests

## Data Cleanup

Test data created during load tests:
- Users: `loadtest-*@test.campcard.org`
- Campaigns: `Load Test Campaign *`

Add cleanup script or use test run ID for filtering:
```sql
DELETE FROM users WHERE email LIKE 'loadtest-%@test.campcard.org';
DELETE FROM campaigns WHERE name LIKE 'Load Test Campaign %';
```

## Next Steps (Remaining Agent Tasks)

1. **Agent H - CI/CD Gating**: GitHub Actions pipeline with quality gates
