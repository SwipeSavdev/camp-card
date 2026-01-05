# PHASE 5e: CACHE LAYER TESTING - REDIS VALIDATION PROCEDURES

**Status:**  **READY TO EXECUTE**
**Duration:** 1 hour
**Tool:** Redis CLI, Redis test client libraries
**Created:** December 28, 2025

---

## Phase 5e Objectives

1. Validate Redis connection and basic operations
2. Test key expiration and TTL enforcement
3. Validate cache invalidation mechanisms
4. Verify data consistency between cache and database
5. Test distributed cache across multiple backend instances
6. Monitor cache performance and hit ratios

---

##  Test 1: Redis Connection & Basic Operations

### Test 1.1: Connection Validation

**Objective:** Verify Redis is accessible and responding

**CLI Command:**

```bash
#!/bin/bash
# File: test-redis-connection.sh

echo "Testing Redis connection..."

# Test 1: Ping Redis
redis-cli -h localhost -p 6379 PING
# Expected output: PONG

# Test 2: Get Redis info
redis-cli -h localhost -p 6379 INFO server
# Expected output: Redis server version, uptime, connected clients, etc.

# Test 3: Check memory status
redis-cli -h localhost -p 6379 INFO memory
# Expected output: Memory stats including used_memory, used_memory_human, etc.

# Test 4: List all databases
redis-cli -h localhost -p 6379 INFO keyspace
# Expected output: Database statistics

echo " Connection tests completed"
```

**Success Criteria:**
- Redis responds to PING
- INFO command returns server data
- Memory stats available
- Connected clients > 0

---

### Test 1.2: Basic CRUD Operations

**Objective:** Verify SET, GET, DELETE operations work correctly

**Script:**

```bash
#!/bin/bash
# File: test-redis-crud.sh

echo "Testing Redis CRUD operations..."

# Test 1: SET a key-value pair
redis-cli -h localhost -p 6379 SET test_key "test_value"
# Expected: OK

# Test 2: GET the value
VALUE=$(redis-cli -h localhost -p 6379 GET test_key)
echo "Retrieved value: $VALUE"
# Expected: test_value

# Test 3: Verify value matches
if [ "$VALUE" = "test_value" ]; then
 echo " SET/GET working correctly"
else
 echo " SET/GET failed"
 exit 1
fi

# Test 4: DELETE the key
redis-cli -h localhost -p 6379 DEL test_key
# Expected: (integer) 1

# Test 5: Verify key deleted
RESULT=$(redis-cli -h localhost -p 6379 GET test_key)
if [ "$RESULT" = "(nil)" ]; then
 echo " DELETE working correctly"
else
 echo " DELETE failed, value still exists"
 exit 1
fi

# Test 6: Increment counter
redis-cli -h localhost -p 6379 SET counter 0
for i in {1..10}; do
 redis-cli -h localhost -p 6379 INCR counter
done
COUNTER=$(redis-cli -h localhost -p 6379 GET counter)
echo "Counter final value: $COUNTER"
# Expected: 10

echo " CRUD operations passed"
```

**Success Criteria:**
- SET stores value
- GET retrieves same value
- DELETE removes key
- INCR increments counter
- No data corruption

---

### Test 1.3: Data Type Testing

**Objective:** Verify Redis handles different data types correctly

**Script:**

```bash
#!/bin/bash
# File: test-redis-types.sh

echo "Testing Redis data types..."

# Test 1: String type
redis-cli -h localhost -p 6379 SET string_key "string_value"
redis-cli -h localhost -p 6379 GET string_key
# Expected: string_value

# Test 2: Hash type (object)
redis-cli -h localhost -p 6379 HSET user:123 name "John" email "john@example.com" role "SCOUT"
redis-cli -h localhost -p 6379 HGETALL user:123
# Expected:
# 1) "name"
# 2) "John"
# 3) "email"
# 4) "john@example.com"
# 5) "role"
# 6) "SCOUT"

# Test 3: List type
redis-cli -h localhost -p 6379 RPUSH offers:available offer123 offer456 offer789
redis-cli -h localhost -p 6379 LRANGE offers:available 0 -1
# Expected:
# 1) "offer123"
# 2) "offer456"
# 3) "offer789"

# Test 4: Set type (unique collection)
redis-cli -h localhost -p 6379 SADD tags:camp camp123 camp456 camp123
redis-cli -h localhost -p 6379 SMEMBERS tags:camp
# Expected:
# 1) "camp123"
# 2) "camp456"
# (Note: camp123 appears only once despite being added twice)

# Test 5: Sorted Set type (with scores)
redis-cli -h localhost -p 6379 ZADD leaderboard 100 player1 200 player2 150 player3
redis-cli -h localhost -p 6379 ZRANGE leaderboard 0 -1 WITHSCORES
# Expected:
# 1) "player1"
# 2) "100"
# 3) "player3"
# 4) "150"
# 5) "player2"
# 6) "200"

echo " Data type tests completed"
```

**Success Criteria:**
- String operations work
- Hash operations work
- List operations work
- Set operations work
- Sorted Set operations work

---

##  Test 2: Expiration & TTL Testing

### Test 2.1: Key Expiration

**Objective:** Verify TTL (Time To Live) is enforced correctly

**Script:**

```bash
#!/bin/bash
# File: test-redis-ttl.sh

echo "Testing Redis key expiration..."

# Test 1: Set key with 5-second expiration
redis-cli -h localhost -p 6379 SET temp_key "temporary_value" EX 5
echo "Key set with 5 second TTL"

# Test 2: Verify key exists immediately
VALUE=$(redis-cli -h localhost -p 6379 GET temp_key)
if [ "$VALUE" = "temporary_value" ]; then
 echo " Key exists immediately after creation"
else
 echo " Key not found immediately"
 exit 1
fi

# Test 3: Check TTL
TTL=$(redis-cli -h localhost -p 6379 TTL temp_key)
echo "TTL remaining: $TTL seconds"

# Test 4: Wait for expiration
echo "Waiting 6 seconds for key to expire..."
sleep 6

# Test 5: Verify key expired
EXPIRED=$(redis-cli -h localhost -p 6379 GET temp_key)
if [ "$EXPIRED" = "(nil)" ]; then
 echo " Key expired as expected"
else
 echo " Key did not expire"
 exit 1
fi

# Test 2.2: EXPIRE command
echo ""
echo "Testing EXPIRE command..."

# Set key without expiration
redis-cli -h localhost -p 6379 SET permanent_key "value"

# Set expiration
redis-cli -h localhost -p 6379 EXPIRE permanent_key 3
echo "Set 3 second expiration on existing key"

# Verify TTL
TTL=$(redis-cli -h localhost -p 6379 TTL permanent_key)
echo "TTL: $TTL seconds"

# Wait and verify expiration
sleep 4
RESULT=$(redis-cli -h localhost -p 6379 GET permanent_key)
if [ "$RESULT" = "(nil)" ]; then
 echo " EXPIRE command working correctly"
else
 echo " EXPIRE command failed"
 exit 1
fi

# Test 2.3: PEXPIRE (millisecond precision)
echo ""
echo "Testing PEXPIRE (millisecond) command..."

redis-cli -h localhost -p 6379 SET ms_key "millisecond_test"
redis-cli -h localhost -p 6379 PEXPIRE ms_key 500 # 500 milliseconds
echo "Set 500ms expiration"

# Verify exists
sleep 0.2
EXISTS=$(redis-cli -h localhost -p 6379 EXISTS ms_key)
if [ "$EXISTS" -eq 1 ]; then
 echo " Key exists after 200ms"
else
 echo " Key expired too early"
 exit 1
fi

# Verify expired
sleep 0.5
EXPIRED=$(redis-cli -h localhost -p 6379 GET ms_key)
if [ "$EXPIRED" = "(nil)" ]; then
 echo " PEXPIRE working correctly (millisecond precision)"
else
 echo " PEXPIRE test failed"
 exit 1
fi

echo " All TTL/expiration tests passed"
```

**Success Criteria:**
- EX option sets expiration correctly
- Keys expire after TTL
- TTL command returns remaining time
- EXPIRE command sets TTL on existing key
- PEXPIRE provides millisecond precision

---

### Test 2.2: Persistent vs Expiring Keys

**Objective:** Verify keys with/without TTL behave differently

**Script:**

```bash
#!/bin/bash
# File: test-redis-persistent.sh

echo "Testing persistent vs expiring keys..."

# Set persistent key (no expiration)
redis-cli -h localhost -p 6379 SET persistent_key "permanent"

# Set expiring key
redis-cli -h localhost -p 6379 SET expiring_key "temporary" EX 10

# Check TTLs
PERSISTENT_TTL=$(redis-cli -h localhost -p 6379 TTL persistent_key)
EXPIRING_TTL=$(redis-cli -h localhost -p 6379 TTL expiring_key)

echo "Persistent key TTL: $PERSISTENT_TTL (expected: -1 = no expiration)"
echo "Expiring key TTL: $EXPIRING_TTL (expected: positive number)"

if [ "$PERSISTENT_TTL" -eq -1 ] && [ "$EXPIRING_TTL" -gt 0 ]; then
 echo " TTL behavior correct"
else
 echo " TTL behavior incorrect"
 exit 1
fi

echo " Persistent vs expiring key test passed"
```

**Success Criteria:**
- Persistent keys have TTL = -1
- Expiring keys have TTL > 0
- Difference is correctly tracked

---

##  Test 3: Cache Invalidation

### Test 3.1: Manual Invalidation

**Objective:** Verify cache can be invalidated when source data changes

**Script:**

```bash
#!/bin/bash
# File: test-cache-invalidation.sh

echo "Testing cache invalidation..."

# Scenario: User data cached in Redis
# When user details change in database, cache must be invalidated

# Step 1: Cache user data
USER_DATA='{"id":"user123","name":"John Doe","email":"john@example.com","role":"SCOUT"}'
redis-cli -h localhost -p 6379 SET "user:123:data" "$USER_DATA" EX 3600
echo " User data cached"

# Step 2: Verify cached data
CACHED=$(redis-cli -h localhost -p 6379 GET "user:123:data")
echo "Cached data: $CACHED"

# Step 3: Simulate user update in database
# (In real scenario, application would make DB update here)
echo "Simulating user update in database..."

# Step 4: Invalidate cache
redis-cli -h localhost -p 6379 DEL "user:123:data"
echo " Cache invalidated"

# Step 5: Verify cache cleared
CLEARED=$(redis-cli -h localhost -p 6379 GET "user:123:data")
if [ "$CLEARED" = "(nil)" ]; then
 echo " Cache successfully cleared"
else
 echo " Cache invalidation failed"
 exit 1
fi

# Step 6: Cache new data (from database)
NEW_DATA='{"id":"user123","name":"John Smith","email":"john.smith@example.com","role":"SCOUT"}'
redis-cli -h localhost -p 6379 SET "user:123:data" "$NEW_DATA" EX 3600
echo " New user data cached"

echo " Cache invalidation test passed"
```

**Success Criteria:**
- Cache entry deleted successfully
- Key returns (nil) after deletion
- New data can be cached

---

### Test 3.2: Pattern-Based Invalidation

**Objective:** Invalidate multiple related cache entries

**Script:**

```bash
#!/bin/bash
# File: test-pattern-invalidation.sh

echo "Testing pattern-based cache invalidation..."

# Step 1: Cache multiple related entries
redis-cli -h localhost -p 6379 SET "offers:camp:001" '["offer1","offer2","offer3"]' EX 3600
redis-cli -h localhost -p 6379 SET "offers:camp:002" '["offer4","offer5"]' EX 3600
redis-cli -h localhost -p 6379 SET "offers:camp:003" '["offer6"]' EX 3600
echo " Cached offers for multiple camps"

# Step 2: List all offer cache keys
KEYS=$(redis-cli -h localhost -p 6379 KEYS "offers:camp:*")
echo "Cached offer keys: $KEYS"

# Step 3: Invalidate all offers (pattern: offers:camp:*)
# Use EVAL with Lua script to avoid KEYS command in production
redis-cli -h localhost -p 6379 EVAL "
 local keys = redis.call('KEYS', 'offers:camp:*')
 for i=1,#keys do
 redis.call('DEL', keys[i])
 end
 return #keys
" 0

echo " Pattern-based invalidation executed"

# Step 4: Verify all cleared
REMAINING=$(redis-cli -h localhost -p 6379 KEYS "offers:camp:*")
if [ -z "$REMAINING" ] || [ "$REMAINING" = "(empty list or set)" ]; then
 echo " All matched keys cleared"
else
 echo " Some keys remain: $REMAINING"
 exit 1
fi

echo " Pattern invalidation test passed"
```

**Success Criteria:**
- Multiple keys matching pattern identified
- All matching keys deleted
- No keys remain after deletion

---

##  Test 4: Cache-Database Consistency

### Test 4.1: Consistency After Update

**Objective:** Verify cache reflects database updates correctly

**Test Scenario:**

```
1. Cache user data (TTL: 1 hour)
 Cache: {"name": "John", "role": "SCOUT"}

2. Update user in database
 Database: {"name": "John Smith", "role": "LEADER"}

3. WITHOUT invalidation  Stale data in cache
 Cache still returns: {"name": "John", "role": "SCOUT"}

4. WITH invalidation  Fresh data on next read
 Cache cleared
 API reads from database
 Cache: {"name": "John Smith", "role": "LEADER"}
```

**Implementation Test:**

```typescript
// File: test-consistency.ts
import Redis from 'ioredis';
import axios from 'axios';

const redis = new Redis('localhost:6379');
const apiClient = axios.create({ baseURL: 'http://localhost:8080' });

async function testConsistency() {
 console.log('Testing cache-database consistency...');

 // Step 1: Get user from API (populates cache)
 const user1 = await apiClient.get('/api/users/123');
 console.log(' Initial user fetch:', user1.data);

 // Verify it's in cache
 const cached1 = await redis.get('user:123:data');
 console.log(' Data cached:', cached1);

 // Step 2: Update user in database (via API)
 const updatedUser = await apiClient.put('/api/users/123', {
 name: 'John Smith',
 role: 'LEADER'
 });
 console.log(' User updated in database:', updatedUser.data);

 // Step 3: Check cache (should be stale)
 const cachedStale = await redis.get('user:123:data');
 console.log('Cache (potentially stale):', cachedStale);

 // Step 4: Invalidate cache (simulating what API should do after update)
 await redis.del('user:123:data');
 console.log(' Cache invalidated');

 // Step 5: Fetch again (reads from database, re-caches)
 const user2 = await apiClient.get('/api/users/123');
 console.log(' Fresh user fetch:', user2.data);

 // Verify updated data is now cached
 const cachedFresh = await redis.get('user:123:data');
 console.log(' Fresh data cached:', cachedFresh);

 // Step 6: Verify consistency
 const cachedObj = JSON.parse(cachedFresh);
 if (cachedObj.name === 'John Smith' && cachedObj.role === 'LEADER') {
 console.log(' Cache-database consistency verified');
 return true;
 } else {
 console.log(' Cache-database mismatch');
 return false;
 }
}

testConsistency().catch(console.error);
```

**Success Criteria:**
- Cache updates when database updates
- Invalidation clears stale data
- Fresh reads repopulate cache
- No serving stale data after invalidation

---

##  Test 5: Distributed Cache (Multi-Instance)

### Test 5.1: Shared Cache Across Instances

**Objective:** Verify multiple backend instances share same Redis cache

**Test Setup:**

```
Backend Instance 1 (Port 8080) 
  Redis (Port 6379) - Shared
Backend Instance 2 (Port 8081) 
```

**Test Script:**

```bash
#!/bin/bash
# File: test-distributed-cache.sh

echo "Testing distributed cache across backend instances..."

# Step 1: Instance 1 sets cache value
echo "Step 1: Instance 1 setting cache..."
RESPONSE1=$(curl -X POST http://localhost:8080/api/cache/set \
 -H "Content-Type: application/json" \
 -d '{"key":"distributed_test","value":"from_instance_1","ttl":300}')
echo "Response: $RESPONSE1"

# Step 2: Verify in Redis directly
VALUE_IN_REDIS=$(redis-cli -h localhost -p 6379 GET "distributed_test")
echo "Value in Redis: $VALUE_IN_REDIS"

# Step 3: Instance 2 retrieves same value
echo "Step 2: Instance 2 retrieving cache..."
RESPONSE2=$(curl -X GET http://localhost:8081/api/cache/get?key=distributed_test)
echo "Response: $RESPONSE2"

# Step 4: Verify both instances see same data
if [[ "$RESPONSE1" == *"from_instance_1"* ]] && [[ "$RESPONSE2" == *"from_instance_1"* ]]; then
 echo " Both instances see same cached data"
else
 echo " Cache not shared between instances"
 exit 1
fi

# Step 5: Instance 2 updates cache
echo "Step 3: Instance 2 updating cache..."
curl -X POST http://localhost:8081/api/cache/set \
 -H "Content-Type: application/json" \
 -d '{"key":"distributed_test","value":"updated_by_instance_2","ttl":300}'

# Step 6: Instance 1 sees updated value
echo "Step 4: Instance 1 retrieving updated cache..."
RESPONSE3=$(curl -X GET http://localhost:8080/api/cache/get?key=distributed_test)
echo "Response: $RESPONSE3"

if [[ "$RESPONSE3" == *"updated_by_instance_2"* ]]; then
 echo " Cache updates visible across instances"
else
 echo " Cache updates not visible"
 exit 1
fi

echo " Distributed cache test passed"
```

**Success Criteria:**
- Instance 1 can set cache
- Instance 2 can read same cache
- Updates from one instance visible to another
- Single Redis serves all instances

---

## Test 6: Performance & Hit Ratio

### Test 6.1: Cache Performance Measurement

**Objective:** Measure cache hit ratio and performance improvement

**Script:**

```bash
#!/bin/bash
# File: test-cache-performance.sh

echo "Testing cache performance and hit ratio..."

# Function to measure request time
measure_request() {
 local url=$1
 /usr/bin/time -f "%e seconds" curl -s -o /dev/null "$url"
}

# Test 1: Uncached request (first request)
echo "Test 1: First request (cache miss)..."
TIME1=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:8080/api/camps)
echo "Time: ${TIME1}s (expected: ~100-300ms)"

# Test 2: Cached request (subsequent requests)
echo "Test 2: Cached request (cache hit)..."
TIME2=$(curl -w "%{time_total}" -o /dev/null -s http://localhost:8080/api/camps)
echo "Time: ${TIME2}s (expected: <50ms)"

# Calculate improvement
IMPROVEMENT=$(echo "scale=1; ($TIME1 - $TIME2) / $TIME1 * 100" | bc)
echo "Performance improvement: ${IMPROVEMENT}%"

# Test 3: Monitor cache statistics
echo ""
echo "Cache Statistics:"
redis-cli -h localhost -p 6379 INFO stats | grep -E "total_commands_processed|instantaneous_ops_per_sec"

# Test 4: Calculate hit ratio
redis-cli -h localhost -p 6379 EVAL "
 local hits = redis.call('HGET', 'cache:stats', 'hits') or 0
 local misses = redis.call('HGET', 'cache:stats', 'misses') or 0
 local total = tonumber(hits) + tonumber(misses)
 if total == 0 then
 return 'No data'
 end
 local ratio = (tonumber(hits) / total) * 100
 return string.format('Hits: %d, Misses: %d, Ratio: %.1f%%', hits, misses, ratio)
" 0
```

**Success Criteria:**
- Cached request faster than uncached
- Speedup at least 2-3x
- Cache hit ratio >80%
- Performance metrics trackable

---

## Phase 5e Completion Checklist

- [ ] Redis connection validated
- [ ] Basic CRUD operations working
- [ ] All data types (string, hash, list, set, zset) working
- [ ] Key expiration (EX, EXPIRE, PEXPIRE) working
- [ ] TTL queries returning correct values
- [ ] Manual cache invalidation working
- [ ] Pattern-based invalidation working
- [ ] Cache-database consistency validated
- [ ] Distributed cache working (multi-instance)
- [ ] Cache performance validated
- [ ] Cache hit ratio measured (>80%)
- [ ] No stale data issues found

---

## Phase 5e Results Summary

**Template: phase-5e-cache-validation-results.md**

```markdown
# Phase 5e: Cache Layer Validation Results

## Test Execution Summary

| Test Category | Status | Duration | Issues |
|---------------|--------|----------|--------|
| Connection | / | __ min | __ |
| CRUD Ops | / | __ min | __ |
| Data Types | / | __ min | __ |
| TTL/Expiration | / | __ min | __ |
| Invalidation | / | __ min | __ |
| Consistency | / | __ min | __ |
| Distributed | / | __ min | __ |
| Performance | / | __ min | __ |

## Key Metrics

- Cache hit ratio: ___ % (target: >80%)
- Avg cached response: ___ ms
- Avg uncached response: ___ ms
- Speedup factor: ___ x
- Redis memory usage: ___ MB
- Connected clients: ___

## Overall Status

Cache layer validation: PASSED / FAILED
```

---

## Next Phase

After Phase 5e completes:
1. Document cache validation findings
2. Proceed to Phase 5f: Message Queue Testing

---

**Phase 5e Status:**  Ready for execution

*Phase 5e ensures Redis caching layer is properly implemented and providing expected performance benefits for the platform.*
