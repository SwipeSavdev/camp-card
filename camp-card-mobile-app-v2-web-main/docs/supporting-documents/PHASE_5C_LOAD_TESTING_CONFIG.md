# PHASE 5c: LOAD & PERFORMANCE TESTING - CONFIGURATION & SCRIPTS

**Status:**  **READY TO EXECUTE**
**Duration:** 2-3 hours
**Tools:** Apache JMeter, k6, Artillery
**Created:** December 28, 2025

---

## Phase 5c Objectives

1. Establish baseline performance metrics under normal load
2. Identify breaking points and scalability limits
3. Validate system stability under sustained 100+ concurrent users
4. Detect memory leaks, connection pool exhaustion, cache issues
5. Measure real-world API response times across all services

---

## Performance Baseline Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| 95th %ile response | <2s | TBD |  To test |
| 99th %ile response | <5s | TBD |  To test |
| Throughput | 500+ req/s | TBD |  To test |
| Error rate | <1% | TBD |  To test |
| CPU usage | <80% | TBD |  To test |
| Memory stable | No leaks | TBD |  To test |
| Cache hit ratio | >80% | TBD |  To test |

---

##  Test Load Scenarios

### Scenario C.1: Authentication Spike (100 Concurrent Logins)

**Objective:** Validate backend can handle login surge (e.g., app lunch day, system recovery)

**Test Configuration:**

```yaml
# JMeter Configuration
Test Plan:
 Thread Group:
 Number of Threads: 100 # 100 concurrent users
 Ramp-up Time: 60 # Over 1 minute
 Loop Count: 1 # Each user logs in once
 Duration: 5 minutes

 HTTP Sampler:
 Protocol: HTTPS
 Host: localhost
 Port: 8080
 Path: /api/auth/login
 Method: POST
 Body:
 {
 "email": "customer${__threadNum}@example.com",
 "password": "password123"
 }

 Response Assertion:
 Status: 200
 Response Time: <2000ms (2 seconds)

 Listeners:
 - Aggregate Report
 - Response Time Graph
 - Active Threads Graph
```

**Metrics to Capture:**
```
- Ramp-up time to 100 users: ___ seconds
- Total login requests: 100
- Successful logins: ___ (target: 100)
- Failed logins: ___ (target: 0)
- Avg response time: ___ ms (target: <500ms)
- 95th %ile response: ___ ms (target: <2000ms)
- 99th %ile response: ___ ms (target: <5000ms)
- Backend CPU at peak: ___ % (target: <80%)
- Backend memory at peak: ___ MB (target: stable)
- Database connections used: ___ of max (target: <80% pool)
- Redis connections used: ___ (target: <20)
```

**Expected Result:**
```
Successful logins: 100/100
Response times:
 - Min: 150ms
 - Avg: 300ms
 - 95%: 800ms
 - 99%: 1500ms
 - Max: 2100ms
Database connections peak: ~50 of 100 available
Memory: Stable throughout test
```

**Success Criteria:**
- 100% login success rate
- 95th %ile response <2 seconds
- No connection pool exhaustion
- Memory remains stable
- No database errors

**k6 Script Alternative:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
 stages: [
 { duration: '1m', target: 100 }, // Ramp up to 100 users
 { duration: '3m', target: 100 }, // Hold at 100 users
 { duration: '1m', target: 0 }, // Ramp down
 ],
 thresholds: {
 http_req_duration: ['p(95)<2000', 'p(99)<5000'], // 95th < 2s, 99th < 5s
 http_req_failed: ['rate<0.01'], // Error rate < 1%
 },
};

export default function () {
 const threadNum = __ENV.THREAD_NUM || Math.random() * 1000000;

 const loginPayload = JSON.stringify({
 email: `customer${threadNum}@example.com`,
 password: 'password123',
 });

 const params = {
 headers: {
 'Content-Type': 'application/json',
 },
 };

 const response = http.post(
 'http://localhost:8080/api/auth/login',
 loginPayload,
 params
 );

 check(response, {
 'status is 200': (r) => r.status === 200,
 'response time < 2s': (r) => r.timings.duration < 2000,
 'has token': (r) => r.json('data.token') !== null,
 });

 sleep(1);
}
```

---

### Scenario C.2: Sustained API Throughput (50 Users, 100 Requests Each)

**Objective:** Measure sustained throughput and API stability over time

**Test Configuration:**

```yaml
# JMeter Configuration
Test Plan:
 Thread Group:
 Number of Threads: 50 # 50 concurrent users
 Ramp-up Time: 30 # Over 30 seconds
 Loop Count: 100 # 100 requests per user = 5000 total
 Duration: 10 minutes

 HTTP Sampler:
 Protocol: HTTPS
 Host: localhost
 Port: 8080
 Path: /api/wallet # Read-heavy endpoint
 Method: GET
 Headers:
 Authorization: Bearer ${TOKEN}

 Response Assertion:
 Status: 200
 Response Time: <200ms (average)

 Listeners:
 - Aggregate Report
 - Throughput Visualizer
```

**Metrics to Capture:**
```
- Total requests sent: 5000
- Successful requests: ___ (target: 5000)
- Failed requests: ___ (target: 0)
- Throughput: ___ requests/second (target: >500 req/s)
- Avg response time: ___ ms (target: <200ms)
- Min response time: ___ ms
- Max response time: ___ ms
- 95th %ile response: ___ ms (target: <500ms)
- 99th %ile response: ___ ms (target: <1000ms)
- Memory growth over time: ___ MB (target: <50MB growth)
- Cache hit ratio: ___ % (target: >80% for GET)
```

**Expected Result:**
```
Throughput: 500+ req/s
Response times:
 - Avg: 80ms
 - 95%: 250ms
 - 99%: 700ms
Memory growth: <20MB (no memory leak)
Cache hits: 85% (many reads of same wallet)
```

**Success Criteria:**
- Sustained 500+ req/s throughput
- 95th %ile response <500ms
- No memory leaks (flat memory graph)
- Error rate <1%
- Cache effectiveness high

**k6 Script:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
 stages: [
 { duration: '30s', target: 50 }, // Ramp up to 50 users
 { duration: '8m', target: 50 }, // Hold at 50 users
 { duration: '1m', target: 0 }, // Ramp down
 ],
 thresholds: {
 http_req_duration: ['p(95)<500', 'p(99)<1000'],
 http_req_failed: ['rate<0.01'],
 },
};

export default function () {
 // Assume token available from earlier login
 const token = __ENV.AUTH_TOKEN;

 const params = {
 headers: {
 'Authorization': `Bearer ${token}`,
 },
 };

 const response = http.get(
 'http://localhost:8080/api/wallet',
 params
 );

 check(response, {
 'status is 200': (r) => r.status === 200,
 'response time < 200ms': (r) => r.timings.duration < 200,
 'has card data': (r) => r.json('data.cards').length > 0,
 });

 sleep(1);
}
```

---

### Scenario C.3: Cache Effectiveness Under Load

**Objective:** Validate caching layer is working and providing efficiency

**Test Configuration:**

```yaml
# JMeter Configuration with Cache Manager
Test Plan:
 Cache Manager:
 Clear cache before each iteration: false
 Use concurrent pool: true

 Thread Group:
 Number of Threads: 50
 Ramp-up Time: 1 minute
 Loop Count: 100 (5000 total requests to same endpoints)

 HTTP Samplers:
 1. GET /api/camps (cacheable for 5 minutes)
 - Expected: Cache hit after 1st request

 2. GET /api/offers (cacheable for 1 hour)
 - Expected: Cache hit for all but 1st request

 3. GET /api/user/${userId} (cacheable for 1 minute)
 - Expected: High cache hit ratio

 Response Assertion:
 X-Cache-Hit header: true (for cached responses)

 Listeners:
 - Response Time Percentiles
 - Cache Statistics
```

**Metrics to Capture:**
```
- Requests to /api/camps: 1000
 - Cache hits: ___ (target: 990+)
 - Cache hit ratio: ___ % (target: >99%)
 - Avg response (cached): ___ ms (target: <50ms)
 - Avg response (uncached): ___ ms (target: <300ms)

- Requests to /api/offers: 1000
 - Cache hits: ___ (target: 999+)
 - Cache hit ratio: ___ % (target: >99%)

- Redis memory usage: ___ MB (target: <100MB)
- Redis hit/miss ratio: ___ (target: >80% hits)
```

**Expected Result:**
```
Cache hits for /api/camps: 990/1000 (99%)
Cache hits for /api/offers: 999/1000 (99.9%)
Response time improvement:
 - Uncached: 250ms
 - Cached: 30ms
 - Speedup: 8.3x faster
```

**Success Criteria:**
- Cache hit ratio >80% overall
- Cached responses <50ms
- Redis memory reasonable (<100MB)
- No stale data served (validated separately)

---

### Scenario C.4: Error Rate Under Stress

**Objective:** Identify breaking point and how system handles graceful degradation

**Test Configuration:**

```yaml
# JMeter - Stress Test
Test Plan:
 Thread Group - Gradual Increase:
 Start: 10 users
 Increment: 10 users every 1 minute
 Max: 200 users (find breaking point)
 Duration: 20 minutes

 HTTP Sampler:
 Path: /api/wallet
 Method: GET

 Response Assertion:
 Status: 200 (track 500, 503, etc.)

 Listeners:
 - Error Rate Graph
 - Response Time vs Load Graph
 - Thread Activity Monitor
```

**Metrics to Capture:**
```
At 50 users:
 - Error rate: ___ % (target: <1%)
 - Response time: ___ ms (target: <500ms)

At 100 users:
 - Error rate: ___ % (target: <1%)
 - Response time: ___ ms (target: <2000ms)

At 150 users:
 - Error rate: ___ % (target: <5%)
 - Response time: ___ ms

At 200 users:
 - Error rate: ___ %
 - Response time: ___ ms
 - Breaking point identified
```

**Expected Result:**
```
System remains stable up to ~150-200 concurrent users
At 200+ users:
 - Error rate increases (503 Service Unavailable)
 - Response times degrade gracefully
 - System recovers after load reduction
```

**Success Criteria:**
- Stable operation up to 100 users
- Graceful degradation beyond limits
- No cascading failures
- System recovers after overload

---

## Monitoring & Metrics Collection

### Backend Metrics to Monitor During Load Tests

```bash
# JVM Metrics (Spring Boot)
- Heap memory usage
- GC pause times
- Thread count
- HTTP request metrics:
 - Requests received
 - Requests completed
 - Request duration (histogram)

# Database Metrics (PostgreSQL)
- Connection pool utilization
- Query duration
- Lock waits
- Slow queries log

# Cache Metrics (Redis)
- Memory usage
- Command rate
- Hit/miss ratio
- Eviction rate
- Key count

# Infrastructure
- CPU usage %
- Disk I/O
- Network bandwidth
- Load average
```

### Monitoring Commands

```bash
# Monitor JVM metrics
jps -l
jstat -gc -h20 <pid> 500 # Every 500ms, header every 20 lines

# Monitor database connections
psql -U postgres -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Monitor Redis
redis-cli INFO
redis-cli MONITOR # Watch all commands
redis-cli SLOWLOG GET 10 # Last 10 slow commands

# Monitor system
top -p <backend-pid>
iostat 1 # I/O statistics
sar 1 # System activity
```

---

##  Performance Analysis Report Template

**Phase 5c-load-test-results-DATE.md**

```markdown
# Load Test Results - [DATE]

## Test Execution Summary

| Scenario | Duration | Users | Requests | Status |
|----------|----------|-------|----------|--------|
| Auth Spike | 5m | 100 | 100 | / |
| Throughput | 9m | 50 | 5000 | / |
| Cache | 10m | 50 | 5000 | / |
| Stress | 20m | 10-200 | ~5000 | / |

## Key Performance Indicators

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| 95th %ile response | <2s | ___ | / |
| 99th %ile response | <5s | ___ | / |
| Throughput | >500 req/s | ___ | / |
| Error rate | <1% | ___ | / |
| Cache hit ratio | >80% | ___ | / |

## Detailed Findings

### Auth Spike Test
- Passed/Failed: __
- Issues: __
- Recommendations: __

### Throughput Test
- Passed/Failed: __
- Issues: __
- Recommendations: __

### Cache Effectiveness Test
- Passed/Failed: __
- Cache hit ratio: __
- Improvements: __

### Stress Test
- Stable up to: __ users
- Breaking point: __ users
- Degradation: graceful/cascading
- Recovery: immediate/delayed

## Resource Utilization

### At Peak Load (100 users)
- CPU: __ %
- Memory: __ MB
- Database connections: __ of __
- Redis memory: __ MB

## Recommendations

1. __
2. __
3. __

## Confidence Impact

- Before Phase 5c: 90%
- After Phase 5c: __% ( on track / issues found)
```

---

## Phase 5c Completion Checklist

- [ ] Auth Spike test executed and passed
- [ ] Throughput test executed and passed
- [ ] Cache effectiveness validated
- [ ] Stress test completed, breaking point identified
- [ ] All metrics captured in analysis report
- [ ] No unexpected errors or timeouts
- [ ] Performance meets or exceeds targets
- [ ] Memory stability confirmed (no leaks)
- [ ] Database connection pool stable
- [ ] Cache layer working efficiently
- [ ] Load test report generated and reviewed
- [ ] Issues documented and prioritized
- [ ] Recommendations provided for optimization

---

## Next Steps After Phase 5c

1. **Document findings** in Phase 5c-load-test-results-DATE.md
2. **Identify optimizations** if performance below targets:
 - Database query optimization
 - Cache strategy improvements
 - Connection pool tuning
 - API endpoint optimization
3. **Proceed to Phase 5d:** Database validation

---

## References

### Tools Documentation
- [Apache JMeter User Guide](https://jmeter.apache.org/usermanual/)
- [k6 Documentation](https://k6.io/docs/)
- [Artillery Load Testing](https://artillery.io/docs)

### Performance Benchmarking
- [REST API Response Time Best Practices](https://www.restapitutorial.com/)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Redis Optimization](https://redis.io/topics/latency)

---

**Phase 5c Status:**  Ready for execution

*Phase 5c validates that the dependency updates in Phase 3 (Axios 1.7.9, TanStack Query 5.90.12) have no negative performance impact and that the platform can handle realistic production loads.*
