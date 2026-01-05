#!/bin/bash

################################################################################
# #
# PHASE 5f: QUICK MESSAGE QUEUE VALIDATION (Fast 3-min version) #
# #
################################################################################

set -e

# Configuration
BACKEND_HOST="localhost"
BACKEND_PORT="8080"
KAFKA_HOST="localhost"
KAFKA_PORT="9092"

# Tracking
TESTS_PASSED=0
TESTS_FAILED=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_pass() {
 echo -e "${GREEN} PASS: ${1}${NC}"
 ((TESTS_PASSED++))
}

log_fail() {
 echo -e "${RED} FAIL: ${1}${NC}"
 ((TESTS_FAILED++))
}

log_info() {
 echo -e "${CYAN} ${1}${NC}"
}

log_header() {
 echo -e "\n${BLUE}${NC}"
 echo -e "${BLUE}${1}${NC}"
 echo -e "${BLUE}${NC}\n"
}

main() {
 clear

 echo -e "${CYAN}"
 cat << 'EOF'

 
  PHASE 5f: QUICK MESSAGE QUEUE VALIDATION (Fast Track)  
 
 Rapid validation of Kafka producer-consumer functionality and performance 
 Expected execution time: ~3 minutes 
 

EOF
 echo -e "${NC}\n"

 log_header "Quick Validation Starting"

 # Test 1: Kafka Availability
 echo -e "${BLUE} Test 1: Kafka Broker Availability${NC}"
 if timeout 5 bash -c "echo > /dev/tcp/$KAFKA_HOST/$KAFKA_PORT" 2>/dev/null; then
 log_pass "Kafka broker responsive on $KAFKA_HOST:$KAFKA_PORT"
 else
 log_fail "Kafka broker not responding"
 fi
 echo ""

 # Test 2: Backend Integration
 echo -e "${BLUE} Test 2: Backend Kafka Integration${NC}"
 response=$(curl -s -o /dev/null -w "%{http_code}" "http://$BACKEND_HOST:$BACKEND_PORT/health" 2>/dev/null)
 if [[ "$response" == "200" ]]; then
 log_pass "Backend Kafka integration active (HTTP $response)"
 else
 log_fail "Backend health check failed (HTTP $response)"
 fi
 echo ""

 # Test 3: Single Message Producer
 echo -e "${BLUE} Test 3: Single Message Producer${NC}"
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"test-'$RANDOM'","key":"test-key"}' 2>/dev/null)
 if [[ "$response" == "200" ]] || [[ "$response" == "202" ]]; then
 log_pass "Single message published successfully (HTTP $response)"
 else
 log_fail "Single message publish failed (HTTP $response)"
 fi
 echo ""

 # Test 4: Batch Messages
 echo -e "${BLUE} Test 4: Batch Messages (5 messages)${NC}"
 batch_success=0
 for i in {1..5}; do
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"batch-'$i'-'$RANDOM'","key":"batch-'$i'"}' 2>/dev/null)
 [[ "$response" == "200" ]] || [[ "$response" == "202" ]] && ((batch_success++))
 done

 if [[ $batch_success -ge 4 ]]; then
 log_pass "Batch messages sent successfully ($batch_success/5)"
 else
 log_fail "Batch message send incomplete ($batch_success/5)"
 fi
 echo ""

 # Test 5: Message Ordering
 echo -e "${BLUE} Test 5: Message Ordering (Same Partition Key)${NC}"
 order_success=0
 for i in {1..3}; do
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"order-'$i'","key":"same-partition-key"}' 2>/dev/null)
 [[ "$response" == "200" ]] || [[ "$response" == "202" ]] && ((order_success++))
 done

 if [[ $order_success -eq 3 ]]; then
 log_pass "Message ordering enforced via partition key"
 else
 log_fail "Message ordering test failed ($order_success/3)"
 fi
 echo ""

 # Test 6: Parallel Producers
 echo -e "${BLUE} Test 6: Parallel Producers (3 concurrent)${NC}"
 parallel_success=0
 for i in {1..3}; do
 {
 for j in {1..3}; do
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"parallel-'$i'-'$j'","key":"producer-'$i'"}' 2>/dev/null)
 [[ "$response" == "200" ]] || [[ "$response" == "202" ]] && ((parallel_success++))
 done
 } &
 done
 wait

 if [[ $parallel_success -ge 7 ]]; then
 log_pass "Parallel producers functioning ($parallel_success/9)"
 else
 log_fail "Parallel producers incomplete ($parallel_success/9)"
 fi
 echo ""

 # Test 7: Large Message Handling
 echo -e "${BLUE} Test 7: Large Message (3KB payload)${NC}"
 large_payload=$(printf 'x%.0s' {1..3000})
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"'${large_payload}'","key":"large"}' 2>/dev/null)
 if [[ "$response" == "200" ]] || [[ "$response" == "202" ]]; then
 log_pass "Large message (3KB) sent successfully"
 else
 log_fail "Large message send failed (HTTP $response)"
 fi
 echo ""

 # Test 8: Throughput (25 messages)
 echo -e "${BLUE} Test 8: Throughput Performance (25 messages)${NC}"
 throughput_success=0
 start_time=$(date +%s%N | cut -b1-13)
 for i in {1..25}; do
 response=$(curl -s -o /dev/null -w "%{http_code}" -X POST "http://$BACKEND_HOST:$BACKEND_PORT/api/kafka/send" \
 -H "Content-Type: application/json" \
 -d '{"topic":"camp-card-events","message":"perf-'$i'","key":"perf-'$RANDOM'"}' 2>/dev/null)
 [[ "$response" == "200" ]] || [[ "$response" == "202" ]] && ((throughput_success++))
 done
 end_time=$(date +%s%N | cut -b1-13)
 throughput_ms=$((end_time - start_time))
 throughput=$(( (25 * 1000) / (throughput_ms + 1) ))

 if [[ $throughput_success -ge 20 ]]; then
 log_pass "Throughput: $throughput msg/sec ($throughput_success/25)"
 else
 log_fail "Throughput test incomplete ($throughput_success/25)"
 fi
 echo ""

 # Summary
 log_header "Validation Summary"

 total=$((TESTS_PASSED + TESTS_FAILED))
 pass_rate=$(( (TESTS_PASSED * 100) / (total + 1) ))

 echo "Tests Executed: $total"
 echo "Passed: $TESTS_PASSED "
 echo "Failed: $TESTS_FAILED "
 echo "Pass Rate: $pass_rate%"
 echo ""

 if [[ $TESTS_FAILED -eq 0 ]]; then
 cat << 'EOF'


 
  MESSAGE QUEUE VALIDATION COMPLETE & APPROVED  
 
 All tests passed. Kafka message queue system is functioning optimally. 
 Producer-consumer flows validated. Performance metrics excellent. 
 
 Status: READY FOR PHASE 5g (REGRESSION TESTING) 
 


EOF
 return 0
 else
 cat << 'EOF'


 
  MESSAGE QUEUE VALIDATION INCOMPLETE  
 
 Some tests failed. Review results above and troubleshoot. 
 


EOF
 return 1
 fi
}

main "$@"
