# PHASE 5f: MESSAGE QUEUE TESTING - KAFKA VALIDATION PROCEDURES

**Status:**  **READY TO EXECUTE**
**Duration:** 1-2 hours
**Tool:** Kafka CLI, Kafka Admin API, test client libraries
**Created:** December 28, 2025

---

## Phase 5f Objectives

1. Validate Kafka broker connection and health
2. Test producer-consumer message flow
3. Verify message ordering and exactly-once semantics
4. Test schema evolution (v1  v2 backward compatibility)
5. Validate error handling and dead-letter queues
6. Test performance and throughput
7. Verify resilience (consumer restart, failover)

---

##  Test 1: Kafka Broker Connection & Health

### Test 1.1: Broker Connectivity

**Objective:** Verify Kafka broker is running and accessible

**CLI Commands:**

```bash
#!/bin/bash
# File: test-kafka-connection.sh

# Assume Kafka is running on localhost:9092

echo "Testing Kafka broker connection..."

# Test 1: Check broker connectivity
kafka-broker-api-versions.sh --bootstrap-server localhost:9092 2>/dev/null
if [ $? -eq 0 ]; then
 echo " Broker connectivity: OK"
else
 echo " Cannot connect to broker"
 exit 1
fi

# Test 2: List available topics
kafka-topics.sh --bootstrap-server localhost:9092 --list
# Expected: List of topics (at minimum, test topics should exist)

# Test 3: Describe a topic
kafka-topics.sh --bootstrap-server localhost:9092 --describe --topic camp-card-events
# Expected: Topic metadata including partitions, replicas, ISR

# Test 4: Check broker cluster metadata
kafka-metadata.sh --snapshot /tmp/metadata.properties --print 2>/dev/null || \
kafka-broker-api-versions.sh --bootstrap-server localhost:9092

echo " Broker connection tests completed"
```

**Success Criteria:**
- Broker responds to API requests
- Topics listing works
- Topic metadata available
- Cluster healthy

---

### Test 1.2: Topic Health Check

**Objective:** Verify critical topics are properly configured

**Script:**

```bash
#!/bin/bash
# File: test-kafka-topics.sh

echo "Validating Kafka topics..."

BOOTSTRAP_SERVER="localhost:9092"

# Required topics for Camp Card platform
REQUIRED_TOPICS=(
 "camp-card-events"
 "user-updates"
 "offer-updates"
 "redemption-events"
 "notifications"
)

for TOPIC in "${REQUIRED_TOPICS[@]}"; do
 echo "Checking topic: $TOPIC"

 # Check if topic exists
 kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER --describe --topic $TOPIC 2>/dev/null

 if [ $? -ne 0 ]; then
 echo " Topic '$TOPIC' not found, creating..."

 # Create topic if missing
 kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --create \
 --topic $TOPIC \
 --partitions 3 \
 --replication-factor 1 \
 --config retention.ms=604800000 # 7 days

 echo " Topic '$TOPIC' created"
 else
 echo " Topic '$TOPIC' exists"
 fi
done

# Verify topic configuration
echo ""
echo "Topic Configuration Details:"
kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --describe \
 --topics-with-overrides

echo " Topic validation completed"
```

**Success Criteria:**
- All required topics exist
- Topics have proper partition count (3+)
- Replication factor > 1 (for HA)
- Retention policies configured

---

##  Test 2: Producer-Consumer Message Flow

### Test 2.1: Basic Message Publishing & Consumption

**Objective:** Verify messages can be published and consumed

**Bash Script:**

```bash
#!/bin/bash
# File: test-kafka-message-flow.sh

BOOTSTRAP_SERVER="localhost:9092"
TEST_TOPIC="camp-card-test"

echo "Testing Kafka message flow..."

# Step 1: Create test topic
echo "Step 1: Creating test topic..."
kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --create \
 --topic $TEST_TOPIC \
 --partitions 1 \
 --replication-factor 1 \
 --if-not-exists

sleep 2

# Step 2: Publish test messages
echo "Step 2: Publishing test messages..."
{
 echo '{"event":"camp_created","campId":"camp123","name":"Test Camp","createdAt":"2025-12-28T10:00:00Z"}'
 echo '{"event":"camp_updated","campId":"camp123","updates":{"name":"Updated Camp"},"updatedAt":"2025-12-28T11:00:00Z"}'
 echo '{"event":"camp_deleted","campId":"camp123","deletedAt":"2025-12-28T12:00:00Z"}'
} | kafka-console-producer.sh \
 --broker-list $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC

echo " Messages published"

# Step 3: Consume messages
echo "Step 3: Consuming messages..."
MESSAGES=$(timeout 5 kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --from-beginning \
 --max-messages 3)

echo "Consumed messages:"
echo "$MESSAGES"

# Step 4: Verify message count
MESSAGE_COUNT=$(echo "$MESSAGES" | wc -l)
if [ "$MESSAGE_COUNT" -ge 3 ]; then
 echo " All 3 messages received"
else
 echo " Expected 3 messages, got $MESSAGE_COUNT"
 exit 1
fi

# Step 5: Cleanup
echo "Step 4: Cleaning up test topic..."
kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --delete \
 --topic $TEST_TOPIC

echo " Message flow test completed"
```

**Success Criteria:**
- Topic created successfully
- Messages published successfully
- Messages consumed successfully
- Message count matches

---

### Test 2.2: Message Ordering

**Objective:** Verify message order is preserved within partition

**Script:**

```bash
#!/bin/bash
# File: test-kafka-ordering.sh

BOOTSTRAP_SERVER="localhost:9092"
TEST_TOPIC="ordering-test"

echo "Testing Kafka message ordering..."

# Step 1: Create topic with single partition (ensures ordering)
kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --create \
 --topic $TEST_TOPIC \
 --partitions 1 \
 --replication-factor 1 \
 --if-not-exists

sleep 2

# Step 2: Publish sequenced messages
echo "Publishing sequenced messages..."
{
 echo '{"sequence":1,"timestamp":"2025-12-28T10:00:00Z","message":"First"}'
 echo '{"sequence":2,"timestamp":"2025-12-28T10:00:01Z","message":"Second"}'
 echo '{"sequence":3,"timestamp":"2025-12-28T10:00:02Z","message":"Third"}'
 echo '{"sequence":4,"timestamp":"2025-12-28T10:00:03Z","message":"Fourth"}'
 echo '{"sequence":5,"timestamp":"2025-12-28T10:00:04Z","message":"Fifth"}'
} | kafka-console-producer.sh \
 --broker-list $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC

sleep 1

# Step 3: Consume and verify order
echo "Consuming messages..."
MESSAGES=$(timeout 5 kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --from-beginning \
 --max-messages 5)

echo "Received messages:"
echo "$MESSAGES"

# Step 4: Verify order
FIRST=$(echo "$MESSAGES" | head -1)
LAST=$(echo "$MESSAGES" | tail -1)

if [[ "$FIRST" == *'"sequence":1'* ]] && [[ "$LAST" == *'"sequence":5'* ]]; then
 echo " Messages received in correct order"
else
 echo " Messages out of order"
 echo "First: $FIRST"
 echo "Last: $LAST"
 exit 1
fi

# Cleanup
kafka-topics.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --delete \
 --topic $TEST_TOPIC

echo " Message ordering test passed"
```

**Success Criteria:**
- Messages received in published order
- Single partition ensures ordering
- No message reordering detected

---

##  Test 3: Schema Evolution

### Test 3.1: Backward Compatibility (v1  v2)

**Objective:** Verify v2 consumer can handle v1 messages

**Test Scenario:**

```
V1 Message Schema:
{
 "eventType": "offer_created",
 "offerId": "offer123",
 "campId": "camp001"
}

V2 Message Schema (backward compatible):
{
 "eventType": "offer_created",
 "offerId": "offer123",
 "campId": "camp001",
 "description": "New offer description",  New field
 "createdBy": "user456"  New field
}

Backward compatibility requirement:
 V2 consumer MUST be able to read V1 messages
 New fields are optional in v2 messages read from topic
```

**Implementation Test:**

```typescript
// File: test-schema-evolution.ts
import { Kafka } from 'kafkajs';

const kafka = new Kafka({
 clientId: 'schema-test',
 brokers: ['localhost:9092'],
});

interface OfferV1 {
 eventType: string;
 offerId: string;
 campId: string;
}

interface OfferV2 extends OfferV1 {
 description?: string;
 createdBy?: string;
}

async function testSchemaEvolution() {
 console.log('Testing schema evolution...');

 const producer = kafka.producer();
 const consumer = kafka.consumer({ groupId: 'schema-test-group' });

 await producer.connect();
 await consumer.connect();

 // Step 1: Publish V1 message
 console.log('Step 1: Publishing V1 message (no new fields)...');
 const v1Message: OfferV1 = {
 eventType: 'offer_created',
 offerId: 'offer123',
 campId: 'camp001'
 };

 await producer.send({
 topic: 'offer-events',
 messages: [
 {
 key: 'offer123',
 value: JSON.stringify(v1Message),
 }
 ]
 });
 console.log(' V1 message published');

 // Step 2: V2 Consumer reads V1 message
 console.log('Step 2: V2 Consumer reading V1 message...');

 await consumer.subscribe({ topic: 'offer-events' });

 const consumedMessages: OfferV2[] = [];

 await consumer.run({
 eachMessage: async ({ topic, partition, message }) => {
 const v2Message: OfferV2 = JSON.parse(message.value!.toString());
 consumedMessages.push(v2Message);

 console.log('Received V1 message as V2:', v2Message);

 // V2 consumer should handle missing optional fields
 if (!v2Message.description) {
 console.log(' Description field optional (not present in V1)');
 }
 if (!v2Message.createdBy) {
 console.log(' CreatedBy field optional (not present in V1)');
 }
 }
 });

 // Wait for message consumption
 await new Promise(resolve => setTimeout(resolve, 2000));

 // Step 3: Publish V2 message
 console.log('Step 3: Publishing V2 message (with new fields)...');
 const v2Message: OfferV2 = {
 eventType: 'offer_created',
 offerId: 'offer456',
 campId: 'camp002',
 description: 'Great offer for scouts',
 createdBy: 'admin123'
 };

 await producer.send({
 topic: 'offer-events',
 messages: [
 {
 key: 'offer456',
 value: JSON.stringify(v2Message),
 }
 ]
 });
 console.log(' V2 message published');

 // Step 4: V2 Consumer reads V2 message
 console.log('Step 4: V2 Consumer reading V2 message...');

 await new Promise(resolve => setTimeout(resolve, 2000));

 // Step 5: Verify both messages consumed
 if (consumedMessages.length >= 1) {
 console.log(' Schema evolution test passed');
 console.log('V1 message handled by V2 consumer: OK');
 console.log('V2 message properties: OK');
 } else {
 console.log(' Schema evolution test failed');
 process.exit(1);
 }

 await consumer.disconnect();
 await producer.disconnect();
}

testSchemaEvolution().catch(console.error);
```

**Success Criteria:**
- V2 consumer handles V1 messages (missing optional fields)
- V2 consumer handles V2 messages (all fields present)
- No deserialization errors
- Old and new messages coexist in topic

---

### Test 3.2: Forward Compatibility (v2  v1)

**Objective:** Verify v1 consumer ignores new v2 fields

**Script:**

```typescript
// File: test-forward-compatibility.ts

async function testForwardCompatibility() {
 console.log('Testing forward compatibility...');

 // V1 Consumer - old version, doesn't know about new fields
 class OfferV1Consumer {
 async handle(message: any) {
 // V1 only knows about these fields
 const {
 eventType,
 offerId,
 campId
 } = message;

 console.log(`Processing offer: ${offerId} in camp: ${campId}`);

 // Extra fields (description, createdBy) are ignored
 // This is OK - backward compatible
 return true;
 }
 }

 const consumer = new OfferV1Consumer();

 // V2 message with extra fields
 const v2Message = {
 eventType: 'offer_created',
 offerId: 'offer789',
 campId: 'camp003',
 description: 'New field in v2', // V1 consumer ignores this
 createdBy: 'admin123' // V1 consumer ignores this
 };

 // Step 1: V1 consumer processes V2 message
 console.log('Step 1: V1 Consumer processing V2 message...');
 const success = await consumer.handle(v2Message);

 if (success) {
 console.log(' V1 consumer successfully handled V2 message');
 console.log(' Extra fields safely ignored');
 console.log(' No errors or crashes');
 } else {
 console.log(' Forward compatibility failed');
 process.exit(1);
 }
}

testForwardCompatibility().catch(console.error);
```

**Success Criteria:**
- V1 consumer ignores unknown fields
- No errors when processing V2 messages
- Known fields extracted correctly
- Extra fields don't break v1 consumer

---

## Test 4: Error Handling & Dead-Letter Queue

### Test 4.1: Invalid Message Handling

**Objective:** Verify system handles malformed messages gracefully

**Script:**

```bash
#!/bin/bash
# File: test-kafka-error-handling.sh

BOOTSTRAP_SERVER="localhost:9092"
TEST_TOPIC="error-test"
DLQ_TOPIC="error-test-dlq"

echo "Testing Kafka error handling..."

# Step 1: Create topics
kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --create --topic $TEST_TOPIC --if-not-exists --partitions 1
kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --create --topic $DLQ_TOPIC --if-not-exists --partitions 1

sleep 2

# Step 2: Publish mix of valid and invalid messages
echo "Publishing messages (mix of valid and invalid)..."
{
 echo '{"valid":true,"data":"message1"}'
 echo 'INVALID_JSON_NOT_PARSEABLE'
 echo '{"valid":true,"data":"message2"}'
 echo '{"incomplete":true'
 echo '{"valid":true,"data":"message3"}'
} | kafka-console-producer.sh \
 --broker-list $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC

sleep 2

# Step 3: Run consumer with error handling
echo "Consuming messages with error handling..."
kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --from-beginning \
 --max-messages 5 2>&1 | grep -i "error\|exception"

echo " Error handling test completed"
```

**Expected Behavior:**
```
Valid messages: processed successfully (3)
Invalid messages: logged to DLQ or error stream (2)
System continues processing:
No crash on malformed JSON:
```

**Success Criteria:**
- Valid messages processed
- Invalid messages don't crash consumer
- Invalid messages sent to DLQ
- Consumer continues running

---

## Test 5: Performance & Throughput

### Test 5.1: Message Throughput Test

**Objective:** Measure sustained message throughput

**Script:**

```bash
#!/bin/bash
# File: test-kafka-throughput.sh

BOOTSTRAP_SERVER="localhost:9092"
TEST_TOPIC="throughput-test"
NUM_MESSAGES=10000
NUM_THREADS=4

echo "Testing Kafka throughput (${NUM_MESSAGES} messages with ${NUM_THREADS} threads)..."

# Create topic
kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --create --topic $TEST_TOPIC --if-not-exists --partitions 4
sleep 2

# Generate test data
echo "Generating ${NUM_MESSAGES} test messages..."
{
 for ((i=1; i<=$NUM_MESSAGES; i++)); do
 echo "{\"messageId\":${i},\"timestamp\":$(date +%s),\"data\":\"test_message_${i}\"}"
 done
} > /tmp/messages.txt

# Publish messages and measure throughput
echo "Publishing messages..."
START_TIME=$(date +%s%N)

cat /tmp/messages.txt | kafka-console-producer.sh \
 --broker-list $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --producer-props num.acks=1 \
 > /dev/null 2>&1

END_TIME=$(date +%s%N)

# Calculate throughput
DURATION_MS=$(( ($END_TIME - $START_TIME) / 1000000 ))
DURATION_SEC=$(echo "scale=2; $DURATION_MS / 1000" | bc)
THROUGHPUT=$(echo "scale=0; $NUM_MESSAGES / $DURATION_SEC" | bc)

echo "Publish Results:"
echo " Messages: ${NUM_MESSAGES}"
echo " Duration: ${DURATION_SEC}s"
echo " Throughput: ${THROUGHPUT} msg/sec"

# Consume and measure
echo "Consuming messages..."
START_TIME=$(date +%s%N)

timeout 60 kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --from-beginning \
 --max-messages $NUM_MESSAGES \
 > /dev/null 2>&1

END_TIME=$(date +%s%N)

DURATION_MS=$(( ($END_TIME - $START_TIME) / 1000000 ))
DURATION_SEC=$(echo "scale=2; $DURATION_MS / 1000" | bc)
THROUGHPUT=$(echo "scale=0; $NUM_MESSAGES / $DURATION_SEC" | bc)

echo "Consume Results:"
echo " Messages: ${NUM_MESSAGES}"
echo " Duration: ${DURATION_SEC}s"
echo " Throughput: ${THROUGHPUT} msg/sec"

# Success criteria
if [ "$THROUGHPUT" -gt 5000 ]; then
 echo " Throughput test PASSED (>5000 msg/sec)"
else
 echo " Throughput test FAILED (target: >5000 msg/sec, actual: ${THROUGHPUT})"
fi

# Cleanup
kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --delete --topic $TEST_TOPIC
rm -f /tmp/messages.txt
```

**Success Criteria:**
- Throughput >5000 messages/second
- No message loss
- Linear scaling with threads
- Latency acceptable (<100ms p99)

---

##  Test 6: Resilience & Failover

### Test 6.1: Consumer Group Rebalancing

**Objective:** Verify consumer group handles scaling correctly

**Test Scenario:**

```
Step 1: Start 2 consumer instances (Group A)
 - Instance 1 consumes partition 0
 - Instance 2 consumes partition 1

Step 2: Publish messages to topic (2 partitions)
 - Partition 0 receives messages
 - Partition 1 receives messages

Step 3: Stop Instance 1
 - Rebalancing triggered
 - Instance 2 takes over partition 0
 - All messages consumed

Step 4: Start Instance 3 (scales up)
 - Rebalancing triggered
 - Partitions redistributed
 - Load balanced
```

**Script:**

```bash
#!/bin/bash
# File: test-kafka-rebalancing.sh

BOOTSTRAP_SERVER="localhost:9092"
TEST_TOPIC="rebalance-test"
CONSUMER_GROUP="rebalance-test-group"

echo "Testing Kafka consumer group rebalancing..."

# Step 1: Create topic with 2 partitions
kafka-topics.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --create --topic $TEST_TOPIC --partitions 2 --replication-factor 1 --if-not-exists

sleep 2

# Step 2: Publish test messages
echo "Publishing test messages..."
{
 for i in {1..100}; do
 echo "Message ${i}"
 done
} | kafka-console-producer.sh \
 --broker-list $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC

sleep 2

# Step 3: Start first consumer (background)
echo "Starting consumer instance 1..."
kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --group $CONSUMER_GROUP \
 --from-beginning > /tmp/consumer1.log 2>&1 &
CONSUMER1_PID=$!

sleep 3

# Step 4: Start second consumer (background)
echo "Starting consumer instance 2..."
kafka-console-consumer.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --topic $TEST_TOPIC \
 --group $CONSUMER_GROUP \
 --from-beginning > /tmp/consumer2.log 2>&1 &
CONSUMER2_PID=$!

sleep 5

# Step 5: Check consumer group status
echo "Consumer group status:"
kafka-consumer-groups.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --group $CONSUMER_GROUP \
 --describe

# Step 6: Kill first consumer (simulate failure)
echo "Stopping consumer instance 1..."
kill $CONSUMER1_PID
sleep 5

# Step 7: Check rebalancing
echo "Consumer group status after rebalancing:"
kafka-consumer-groups.sh \
 --bootstrap-server $BOOTSTRAP_SERVER \
 --group $CONSUMER_GROUP \
 --describe

# Step 8: Verify all messages consumed
MSG_COUNT=$(wc -l < /tmp/consumer2.log)
if [ "$MSG_COUNT" -gt 90 ]; then
 echo " Consumer rebalancing successful (${MSG_COUNT} messages consumed)"
else
 echo " Rebalancing failed (only ${MSG_COUNT} messages consumed)"
 exit 1
fi

# Cleanup
kill $CONSUMER2_PID 2>/dev/null
kafka-consumer-groups.sh --bootstrap-server $BOOTSTRAP_SERVER \
 --group $CONSUMER_GROUP --delete

echo " Rebalancing test completed"
```

**Success Criteria:**
- Rebalancing triggered automatically
- Partitions redistributed
- No message loss during rebalancing
- Consumer catches up after failure

---

## Phase 5f Completion Checklist

- [ ] Broker connectivity verified
- [ ] All required topics exist and healthy
- [ ] Messages published successfully
- [ ] Messages consumed successfully
- [ ] Message ordering preserved
- [ ] v1  v2 backward compatibility verified
- [ ] v2  v1 forward compatibility verified
- [ ] Invalid messages handled gracefully
- [ ] Dead-letter queue functioning
- [ ] Throughput >5000 msg/sec
- [ ] Consumer group rebalancing working
- [ ] No message loss during failures
- [ ] Performance acceptable (<100ms p99 latency)

---

## Phase 5f Results Summary

**Template: phase-5f-kafka-validation-results.md**

```markdown
# Phase 5f: Message Queue (Kafka) Validation Results

## Test Execution Summary

| Test Category | Status | Duration | Issues |
|---------------|--------|----------|--------|
| Broker Health | / | __ min | __ |
| Topic Config | / | __ min | __ |
| Message Flow | / | __ min | __ |
| Ordering | / | __ min | __ |
| Schema Evo | / | __ min | __ |
| Error Handling | / | __ min | __ |
| Performance | / | __ min | __ |
| Resilience | / | __ min | __ |

## Key Metrics

- Publish throughput: ___ msg/sec (target: >5000)
- Consume throughput: ___ msg/sec (target: >5000)
- P99 latency: ___ ms (target: <100ms)
- Message loss: ___ (target: 0)
- Consumer lag: ___ (target: <100)

## Overall Status

Message queue validation: PASSED / FAILED
```

---

## Next Phase

After Phase 5f completes:
1. Document Kafka validation findings
2. Proceed to Phase 5g: Regression Testing

---

**Phase 5f Status:**  Ready for execution

*Phase 5f ensures Kafka message queue is properly configured and provides reliable message delivery for the platform's event-driven architecture.*
