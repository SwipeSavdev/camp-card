#!/bin/bash

# Phase 5b Automated API Test Suite
# Tests authentication flows without requiring manual UI interaction

set -e

BASE_PATH="/Users/macbookpro/Documents/camp-card-mobile-app-v2"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
TEST_LOG="$BASE_PATH/logs/phase-5b-api-tests-$TIMESTAMP.log"
mkdir -p "$(dirname "$TEST_LOG")"

# Test credentials
CUSTOMER_EMAIL="customer@example.com"
CUSTOMER_PASS="password123"
SCOUT_EMAIL="scout@example.com"
SCOUT_PASS="password123"
LEADER_EMAIL="leader@example.com"
LEADER_PASS="password123"

# Backend URL
BACKEND_URL="http://localhost:8080"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log output
log_test() {
 local test_name="$1"
 local status="$2"
 local details="$3"

 echo "[$(date '+%Y-%m-%d %H:%M:%S')] $test_name - $status: $details" >> "$TEST_LOG"

 if [ "$status" = "PASS" ]; then
 echo -e "${GREEN} PASS${NC}: $test_name"
 ((PASSED_TESTS++))
 else
 echo -e "${RED} FAIL${NC}: $test_name"
 echo -e " Details: $details"
 ((FAILED_TESTS++))
 fi
 ((TOTAL_TESTS++))
}

# Function to execute API test
api_test() {
 local test_name="$1"
 local method="$2"
 local endpoint="$3"
 local auth_token="$4"
 local data="$5"

 local url="$BACKEND_URL$endpoint"
 local cmd="curl -s -X $method '$url'"

 if [ -n "$auth_token" ]; then
 cmd="$cmd -H 'Authorization: Bearer $auth_token'"
 fi

 if [ -n "$data" ]; then
 cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
 fi

 # Execute command
 local response=$(eval $cmd)
 local http_code=$(curl -s -o /dev/null -w "%{http_code}" -X $method "$url" \
 ${auth_token:+-H "Authorization: Bearer $auth_token"} \
 ${data:+-H "Content-Type: application/json" -d "$data"})

 echo "$response"
}

echo ""
echo ""
echo " Phase 5b API Test Suite"
echo " Started: $TIMESTAMP"
echo ""
echo ""

# Check backend connectivity
echo " Checking Backend Connectivity..."
if curl -s http://localhost:8080/health | grep -q "ok"; then
 echo -e "${GREEN} Backend is responding${NC}"
else
 echo -e "${RED} Backend is not responding on port 8080${NC}"
 echo " Please ensure backend is running: java -jar repos/camp-card-backend/target/campcard.jar"
 exit 1
fi
echo ""

# 
# SCENARIO 1: MOBILE AUTHENTICATION
# 

echo " SCENARIO 1: Mobile Authentication"
echo ""

# Test 1.1: Customer Login Success
echo "Test 1.1: Customer Login Success"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASS\"}")

if echo "$RESPONSE" | grep -q "access_token"; then
 CUSTOMER_TOKEN=$(echo "$RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
 log_test "Test 1.1: Customer Login" "PASS" "Token received: ${CUSTOMER_TOKEN:0:20}..."
else
 log_test "Test 1.1: Customer Login" "FAIL" "No token in response: $RESPONSE"
fi

# Test 1.2: Invalid Credentials
echo "Test 1.2: Invalid Credentials"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"wrongpassword\"}")

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"wrongpassword\"}")

if [ "$HTTP_CODE" = "401" ]; then
 log_test "Test 1.2: Invalid Credentials" "PASS" "API rejected with 401"
else
 log_test "Test 1.2: Invalid Credentials" "FAIL" "Expected 401, got $HTTP_CODE"
fi

# Test 1.3: Token Validation
if [ -n "$CUSTOMER_TOKEN" ]; then
 echo "Test 1.3: Token Validation"
 RESPONSE=$(curl -s -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer $CUSTOMER_TOKEN")

 if echo "$RESPONSE" | grep -q "email\|id"; then
 log_test "Test 1.3: Token Validation" "PASS" "Token accepted by API"
 else
 log_test "Test 1.3: Token Validation" "FAIL" "API rejected token: $RESPONSE"
 fi
fi

echo ""

# 
# SCENARIO 2: WEB AUTHENTICATION
# 

echo " SCENARIO 2: Web Portal Authentication"
echo ""

# Test 2.1: Scout Login
echo "Test 2.1: Scout Login Success"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$SCOUT_EMAIL\",\"password\":\"$SCOUT_PASS\"}")

if echo "$RESPONSE" | grep -q "token"; then
 SCOUT_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
 log_test "Test 2.1: Scout Login" "PASS" "Token received: ${SCOUT_TOKEN:0:20}..."
else
 log_test "Test 2.1: Scout Login" "FAIL" "No token in response: $RESPONSE"
fi

# Test 2.2: Scout Dashboard Access
if [ -n "$SCOUT_TOKEN" ]; then
 echo "Test 2.2: Scout Dashboard Access"
 HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/scout/dashboard" \
 -H "Authorization: Bearer $SCOUT_TOKEN")

 if [ "$HTTP_CODE" = "200" ]; then
 log_test "Test 2.2: Scout Dashboard Access" "PASS" "API returned 200"
 else
 log_test "Test 2.2: Scout Dashboard Access" "FAIL" "API returned $HTTP_CODE"
 fi
fi

echo ""

# 
# SCENARIO 3: CROSS-SERVICE TOKEN VALIDATION
# 

echo " SCENARIO 3: Cross-Service Token Validation"
echo ""

# Test 3.1: JWT Structure Validation
if [ -n "$CUSTOMER_TOKEN" ]; then
 echo "Test 3.1: JWT Structure Validation"
 # JWT should have 3 parts separated by dots
 PARTS=$(echo "$CUSTOMER_TOKEN" | tr '.' '\n' | wc -l)
 if [ "$PARTS" = "3" ]; then
 log_test "Test 3.1: JWT Structure" "PASS" "Token has valid 3-part structure"
 else
 log_test "Test 3.1: JWT Structure" "FAIL" "Token has $PARTS parts, expected 3"
 fi
fi

# Test 3.2: Token Cross-Service Usage
if [ -n "$SCOUT_TOKEN" ]; then
 echo "Test 3.2: Scout Token Cross-Service Usage"
 HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/scout/profile" \
 -H "Authorization: Bearer $SCOUT_TOKEN")

 if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "403" ]; then
 log_test "Test 3.2: Token Cross-Service" "PASS" "API properly validated token (HTTP $HTTP_CODE)"
 else
 log_test "Test 3.2: Token Cross-Service" "FAIL" "API returned unexpected $HTTP_CODE"
 fi
fi

echo ""

# 
# SCENARIO 4: TOKEN OPERATIONS
# 

echo " SCENARIO 4: Token Operations"
echo ""

# Test 4.1: Token Claims Validation
if [ -n "$CUSTOMER_TOKEN" ]; then
 echo "Test 4.1: Token Claims Validation"
 # Decode token claims (without verification)
 CLAIMS=$(echo "$CUSTOMER_TOKEN" | cut -d'.' -f2 | base64 -D 2>/dev/null || echo "decode_failed")

 if echo "$CLAIMS" | grep -q "email\|sub"; then
 log_test "Test 4.1: Token Claims" "PASS" "Token contains expected claims"
 else
 log_test "Test 4.1: Token Claims" "FAIL" "Token missing expected claims"
 fi
fi

# Test 4.2: Token Reuse (should work)
if [ -n "$CUSTOMER_TOKEN" ]; then
 echo "Test 4.2: Token Reuse"
 HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer $CUSTOMER_TOKEN")

 if [ "$HTTP_CODE" = "200" ]; then
 log_test "Test 4.2: Token Reuse" "PASS" "Token can be reused"
 else
 log_test "Test 4.2: Token Reuse" "FAIL" "Token reuse failed with HTTP $HTTP_CODE"
 fi
fi

echo ""

# 
# SCENARIO 5: SECURITY VALIDATION
# 

echo " SCENARIO 5: Security Validation"
echo ""

# Test 5.1: CORS Headers
echo "Test 5.1: CORS Headers Validation"
HEADERS=$(curl -s -i -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer $CUSTOMER_TOKEN" 2>/dev/null | head -20)

if echo "$HEADERS" | grep -qi "X-Content-Type-Options.*nosniff\|X-Frame-Options.*DENY"; then
 log_test "Test 5.1: CORS Headers" "PASS" "Security headers present"
else
 log_test "Test 5.1: CORS Headers" "FAIL" "Missing or incomplete security headers"
fi

# Test 5.2: Invalid Token Rejection
echo "Test 5.2: Invalid Token Rejection"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer invalid.token.here")

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
 log_test "Test 5.2: Invalid Token Rejection" "PASS" "Invalid token rejected (HTTP $HTTP_CODE)"
else
 log_test "Test 5.2: Invalid Token Rejection" "FAIL" "Invalid token not rejected (HTTP $HTTP_CODE)"
fi

echo ""

# 
# RESULTS SUMMARY
# 

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))

echo ""
echo " Phase 5b API Test Results"
echo ""
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo "Tests Passed: $PASSED_TESTS"
echo "Tests Failed: $FAILED_TESTS"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ "$PASS_RATE" -ge 90 ]; then
 echo -e "${GREEN} Phase 5b API Tests PASSED${NC}"
 echo "Pass rate 90% achieved. Ready for Phase 5c."
 EXIT_CODE=0
else
 echo -e "${YELLOW} Phase 5b API Tests needs review${NC}"
 echo "Pass rate below 90%. Review failures above."
 EXIT_CODE=1
fi

echo ""
echo "Test Log: $TEST_LOG"
echo ""
echo ""

exit $EXIT_CODE
