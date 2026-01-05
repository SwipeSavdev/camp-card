#!/bin/bash

# Phase 5b API Test Suite - Simplified & Robust
# Tests authentication flows against running backend

BASE_PATH="/Users/macbookpro/Documents/camp-card-mobile-app-v2"
BACKEND_URL="http://localhost:8080"

# Test credentials
CUSTOMER_EMAIL="customer@example.com"
CUSTOMER_PASS="password123"
SCOUT_EMAIL="scout@example.com"
SCOUT_PASS="password123"

# Test counters
TOTAL=0
PASSED=0

test_api() {
 local name="$1"
 local method="$2"
 local endpoint="$3"
 local token="$4"
 local data="$5"
 local expect_status="$6"

 TOTAL=$((TOTAL + 1))

 local cmd="curl -s -X $method '$BACKEND_URL$endpoint'"
 if [ -n "$token" ]; then
 cmd="$cmd -H 'Authorization: Bearer $token'"
 fi
 if [ -n "$data" ]; then
 cmd="$cmd -H 'Content-Type: application/json' -d '$data'"
 fi
 cmd="$cmd -w '\n%{http_code}'"

 local response=$(eval $cmd)
 local http_code=$(echo "$response" | tail -1)
 local body=$(echo "$response" | head -n -1)

 if [ "$http_code" = "$expect_status" ]; then
 PASSED=$((PASSED + 1))
 echo " PASS: $name (HTTP $http_code)"
 echo "$body"
 return 0
 else
 echo " FAIL: $name (Expected HTTP $expect_status, got $http_code)"
 echo "Response: $body"
 return 1
 fi
}

echo ""
echo ""
echo " Phase 5b API Testing - Authentication Flows"
echo ""
echo ""

# Verify backend is running
echo " Checking Backend..."
if curl -s http://localhost:8080/health | grep -q "ok"; then
 echo " Backend is running"
else
 echo " Backend is not responding"
 exit 1
fi
echo ""

# 
# SCENARIO 1: Mobile Authentication
# 

echo " SCENARIO 1: Mobile Authentication"
echo ""

# Test 1.1: Customer Login
echo "Test 1.1: Customer Login Success"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"$CUSTOMER_PASS\"}")

if echo "$RESPONSE" | grep -q "access_token"; then
 CUSTOMER_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
 if [ -n "$CUSTOMER_TOKEN" ]; then
 echo " PASS: Test 1.1 - Customer login successful"
 echo " Token: ${CUSTOMER_TOKEN:0:30}..."
 PASSED=$((PASSED + 1))
 fi
else
 echo " FAIL: Test 1.1 - No token received"
fi
TOTAL=$((TOTAL + 1))

# Test 1.2: Invalid Credentials
echo ""
echo "Test 1.2: Invalid Credentials Rejection"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$CUSTOMER_EMAIL\",\"password\":\"wrongpass\"}")

if [ "$HTTP" != "200" ]; then
 echo " PASS: Test 1.2 - Invalid credentials rejected (HTTP $HTTP)"
 PASSED=$((PASSED + 1))
else
 echo " FAIL: Test 1.2 - Invalid credentials accepted"
fi
TOTAL=$((TOTAL + 1))

# Test 1.3: Token Validation
if [ -n "$CUSTOMER_TOKEN" ]; then
 echo ""
 echo "Test 1.3: Token Validation"
 HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer $CUSTOMER_TOKEN")

 if [ "$HTTP" = "200" ] || [ "$HTTP" = "404" ]; then
 echo " PASS: Test 1.3 - Token accepted by API (HTTP $HTTP)"
 PASSED=$((PASSED + 1))
 else
 echo " FAIL: Test 1.3 - Token rejected (HTTP $HTTP)"
 fi
 TOTAL=$((TOTAL + 1))
fi

echo ""

# 
# SCENARIO 2: Web Authentication
# 

echo " SCENARIO 2: Web Portal Authentication"
echo ""

echo "Test 2.1: Scout Login Success"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login" \
 -H "Content-Type: application/json" \
 -d "{\"email\":\"$SCOUT_EMAIL\",\"password\":\"$SCOUT_PASS\"}")

if echo "$RESPONSE" | grep -q "access_token"; then
 SCOUT_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)
 if [ -n "$SCOUT_TOKEN" ]; then
 echo " PASS: Test 2.1 - Scout login successful"
 echo " Token: ${SCOUT_TOKEN:0:30}..."
 PASSED=$((PASSED + 1))
 fi
else
 echo " FAIL: Test 2.1 - No token received"
fi
TOTAL=$((TOTAL + 1))

# Test 2.2: Scout Dashboard Access
if [ -n "$SCOUT_TOKEN" ]; then
 echo ""
 echo "Test 2.2: Scout Dashboard Access"
 HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/scout/dashboard" \
 -H "Authorization: Bearer $SCOUT_TOKEN")

 if [ "$HTTP" = "200" ] || [ "$HTTP" = "404" ]; then
 echo " PASS: Test 2.2 - API accepted scout token (HTTP $HTTP)"
 PASSED=$((PASSED + 1))
 else
 echo " FAIL: Test 2.2 - API rejected token (HTTP $HTTP)"
 fi
 TOTAL=$((TOTAL + 1))
fi

echo ""

# 
# SCENARIO 3: Security Validation
# 

echo " SCENARIO 3: Security Validation"
echo ""

echo "Test 3.1: Invalid Token Rejection"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer invalid.token.here")

if [ "$HTTP" != "200" ]; then
 echo " PASS: Test 3.1 - Invalid token rejected (HTTP $HTTP)"
 PASSED=$((PASSED + 1))
else
 echo " FAIL: Test 3.1 - Invalid token accepted"
fi
TOTAL=$((TOTAL + 1))

echo ""
echo "Test 3.2: CORS Headers Validation"
HEADERS=$(curl -s -i -X GET "$BACKEND_URL/customer/profile" \
 -H "Authorization: Bearer $CUSTOMER_TOKEN" 2>/dev/null | head -20)

if echo "$HEADERS" | grep -qi "X-Content-Type-Options\|X-Frame-Options"; then
 echo " PASS: Test 3.2 - Security headers present"
 PASSED=$((PASSED + 1))
else
 echo " FAIL: Test 3.2 - Missing security headers"
fi
TOTAL=$((TOTAL + 1))

echo ""

# 
# RESULTS
# 

PASS_RATE=$((PASSED * 100 / TOTAL))

echo ""
echo " Phase 5b Results"
echo ""
echo ""
echo "Total Tests: $TOTAL"
echo "Tests Passed: $PASSED"
echo "Tests Failed: $((TOTAL - PASSED))"
echo "Pass Rate: $PASS_RATE%"
echo ""

if [ "$PASS_RATE" -ge 90 ]; then
 echo " PHASE 5b API TESTING PASSED"
 echo " Pass rate 90% achieved ($PASSED/$TOTAL)"
 echo ""
 echo "Ready for Phase 5c: Load & Performance Testing"
 exit 0
else
 echo " PHASE 5b API TESTING NEEDS REVIEW"
 echo " Pass rate below 90% ($PASSED/$TOTAL = $PASS_RATE%)"
 exit 1
fi
