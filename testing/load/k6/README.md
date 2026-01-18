# Camp Card Load Testing with k6

Load and performance testing for the Camp Card API using [k6](https://k6.io/).

## Prerequisites

Install k6:

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6

# Docker
docker pull grafana/k6
```

## Quick Start

```bash
# Run smoke test (default)
k6 run scenarios.js

# Run specific scenario
k6 run --env SCENARIO=smoke scenarios.js
k6 run --env SCENARIO=load scenarios.js
k6 run --env SCENARIO=stress scenarios.js
k6 run --env SCENARIO=soak scenarios.js
k6 run --env SCENARIO=spike scenarios.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `https://bsa.swipesavvy.com/api/v1` | API base URL |
| `ADMIN_EMAIL` | `admin@campcard.org` | Admin login email |
| `ADMIN_PASSWORD` | `Password123` | Admin login password |
| `SCENARIO` | `smoke` | Test scenario to run |
| `TEST_RUN_ID` | Auto-generated | Unique test run identifier |

## Test Scenarios

### Smoke Test
Quick validation that the API is responding.
- **Users:** 1
- **Duration:** 30 seconds
- **Purpose:** Quick health check

```bash
k6 run --env SCENARIO=smoke scenarios.js
```

### Load Test
Simulate normal traffic patterns.
- **Users:** Ramps from 0 → 50 → 100 → 0
- **Duration:** ~16 minutes
- **Purpose:** Validate performance under expected load

```bash
k6 run --env SCENARIO=load scenarios.js
```

### Stress Test
Find the breaking point.
- **Users:** Ramps from 0 → 100 → 200 → 300 → 0
- **Duration:** ~16 minutes
- **Purpose:** Identify system limits

```bash
k6 run --env SCENARIO=stress scenarios.js
```

### Soak Test
Sustained load over time.
- **Users:** 50 constant
- **Duration:** 30 minutes
- **Purpose:** Find memory leaks, resource exhaustion

```bash
k6 run --env SCENARIO=soak scenarios.js
```

### Spike Test
Sudden traffic burst.
- **Users:** 0 → 200 (instant) → 0
- **Duration:** ~3 minutes
- **Purpose:** Test auto-scaling, graceful degradation

```bash
k6 run --env SCENARIO=spike scenarios.js
```

## SLA Targets

| Metric | Target | Description |
|--------|--------|-------------|
| Error Rate | < 1% | API errors |
| P95 Response Time | < 1500ms | 95th percentile |
| Login P95 | < 500ms | Auth endpoint |
| Read P95 | < 1000ms | GET endpoints |

## Endpoints Tested

### Read Operations (80% of traffic)
- `GET /auth/me` - Current user profile
- `GET /users` - User list (paginated)
- `GET /councils` - Council list
- `GET /merchants` - Merchant list
- `GET /offers` - Offer list
- `GET /campaigns` - Campaign list
- `GET /camp-cards` - Camp card list
- `GET /subscription-plans` - Available plans (public)

### Write Operations (5% of traffic)
- `POST /users` - Create user
- `POST /campaigns` - Create campaign

## Output

Test results are output in two formats:

1. **Console Summary** - Human-readable summary
2. **JSON Report** - `load-test-report-{TEST_RUN_ID}.json`

### Sample Output

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

## CI/CD Integration

### GitHub Actions

```yaml
- name: Run k6 Load Test
  uses: grafana/k6-action@v0.3.1
  with:
    filename: testing/load/k6/scenarios.js
  env:
    BASE_URL: https://bsa.swipesavvy.com/api/v1
    SCENARIO: smoke
```

### Docker

```bash
docker run --rm -i \
  -e BASE_URL=https://bsa.swipesavvy.com/api/v1 \
  -e SCENARIO=load \
  grafana/k6 run - < scenarios.js
```

## Custom Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `login_success` | Rate | Successful login rate |
| `api_errors` | Counter | Total API errors |
| `user_create_time` | Trend | User creation latency |
| `campaign_create_time` | Trend | Campaign creation latency |
| `council_read_time` | Trend | Council list latency |
| `merchant_read_time` | Trend | Merchant list latency |

## Troubleshooting

### Login Failures
```
VU 1: Login failed, skipping iteration
```
- Check `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables
- Verify the user exists and is active
- Check if the API is accessible

### Rate Limiting
```
status: 429 (Too Many Requests)
```
- Reduce VU count
- Add more sleep time between requests
- Contact backend team to whitelist test IPs

### Timeout Errors
```
context deadline exceeded
```
- Increase timeout in k6 options
- Check network connectivity
- Server might be under heavy load
