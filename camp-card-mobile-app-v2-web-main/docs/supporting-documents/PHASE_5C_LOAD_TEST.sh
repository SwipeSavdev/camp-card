#!/bin/bash

# Phase 5c - Load & Performance Testing Suite
# Tests backend performance under increasing concurrent user load

BASE_URL="http://localhost:8080"
RESULTS_DIR="/tmp/phase5c-results"
mkdir -p "$RESULTS_DIR"

# Test credentials
CUSTOMER_EMAIL="customer@example.com"
SCOUT_EMAIL="scout@example.com"

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo ""
echo " Phase 5c: Load & Performance Testing"
echo ""
echo ""

# Check if backend is running
echo " Checking Backend Connectivity..."
if ! curl -s http://localhost:8080/health | grep -q "ok"; then
 echo -e "${RED} Backend is not responding${NC}"
 exit 1
fi
echo -e "${GREEN} Backend is running${NC}"
echo ""

# Get baseline token for testing
echo " Obtaining test token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"password123\"}")

TOKEN=$(echo "$TOKEN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
if [ -z "$TOKEN" ]; then
 echo -e "${RED} Failed to obtain test token${NC}"
 exit 1
fi
echo -e "${GREEN} Test token obtained${NC}"
echo ""

# Function to test single concurrent request
test_single_request() {
 local start_time=$(date +%s%N | cut -b1-13)
 local response=$(curl -s -X GET "$BASE_URL/customer/profile" \
 -H "Authorization: Bearer $TOKEN" \
 -w "\n%{http_code}" 2>/dev/null)
 local end_time=$(date +%s%N | cut -b1-13)
 local duration=$((end_time - start_time))
 local http_code=$(echo "$response" | tail -1)

 echo "$duration"
}

# Load test with concurrent requests
run_load_test() {
 local num_users=$1
 local requests_per_user=$2
 local test_name="$num_users users  $requests_per_user requests"

 echo ""
 echo " Load Test: $test_name"
 echo ""

 local total_requests=$((num_users * requests_per_user))
 local successful=0
 local failed=0
 local timings=()

 echo "Sending $total_requests requests..."

 # Send requests in background to simulate concurrent load
 local start=$(date +%s%N | cut -b1-13)

 for ((i=0; i<num_users; i++)); do
 for ((j=0; j<requests_per_user; j++)); do
 # Make request in background
 (
 response=$(curl -s -X GET "$BASE_URL/customer/profile" \
 -H "Authorization: Bearer $TOKEN" \
 -w "\n%{http_code}")
 http_code=$(echo "$response" | tail -1)
 if [ "$http_code" = "200" ] || [ "$http_code" = "404" ]; then
 echo "success"
 else
 echo "fail"
 fi
 ) > "$RESULTS_DIR/request_${i}_${j}.txt" &

 # Limit concurrent background jobs
 if [ $((($i * requests_per_user + $j + 1) % 20)) -eq 0 ]; then
 wait -n
 fi
 done
 done

 # Wait for all background jobs
 wait

 local end=$(date +%s%N | cut -b1-13)
 local total_time=$((end - start))

 # Count results
 successful=$(grep -l "success" "$RESULTS_DIR"/request_*.txt 2>/dev/null | wc -l)
 failed=$(grep -l "fail" "$RESULTS_DIR"/request_*.txt 2>/dev/null | wc -l)

 local success_rate=$((successful * 100 / total_requests))
 local requests_per_sec=$((total_requests * 1000 / total_time))
 local avg_response_time=$((total_time / total_requests))

 echo ""
 echo " Requests Completed: $total_requests"
 echo " Successful: $successful"
 echo " Failed: $failed"
 echo " Success Rate: ${success_rate}%"
 echo " Total Time: ${total_time}ms"
 echo " Avg Response Time: ${avg_response_time}ms"
 echo " Throughput: ${requests_per_sec} req/sec"
 echo ""

 # Save results
 echo "$num_users,$requests_per_user,$total_requests,$successful,$failed,$success_rate,$avg_response_time,$requests_per_sec" >> "$RESULTS_DIR/results.csv"

 # Check success criteria
 if [ "$success_rate" -lt 95 ]; then
 echo -e "${YELLOW} Success rate below 95%${NC}"
 fi
 if [ "$avg_response_time" -gt 2000 ]; then
 echo -e "${YELLOW} Average response time exceeds 2 seconds${NC}"
 fi
 if [ "$requests_per_sec" -lt 100 ]; then
 echo -e "${YELLOW} Throughput below target (100 req/sec)${NC}"
 fi

 echo ""
}

# Run load tests with increasing user counts
echo " PHASE 5c: Load Testing"
echo ""
echo ""

# Initialize results file
echo "users,requests_per_user,total_requests,successful,failed,success_rate,avg_response_time_ms,throughput_req_per_sec" > "$RESULTS_DIR/results.csv"

# Test scenarios
run_load_test 10 5 # 50 requests total
run_load_test 25 4 # 100 requests total
run_load_test 50 2 # 100 requests total

# Summary
echo ""
echo " Phase 5c Results Summary"
echo ""
echo ""

cat "$RESULTS_DIR/results.csv" | awk -F',' 'NR>1 {
 printf "%-8s %-8s %-12s %-10s %-8s %6s%% %-8s %-12s\n",
 $1" users", $2" req", $3" total", $4" ok", $5" fail", $6, $7"ms", $8" req/s"
}'

echo ""
echo ""
echo " Phase 5c Load Testing Complete"
echo ""
echo ""

# Cleanup
rm -f "$RESULTS_DIR"/request_*.txt
