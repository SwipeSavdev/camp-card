#!/bin/bash
# Controller Endpoint Verification Script
# Tests all backend controller endpoints

BASE_URL="http://localhost:8080/v1"
HEALTH_URL="http://localhost:8080"

echo "=========================================="
echo "Camp Card Backend Controller Test Suite"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test endpoint
test_endpoint() {
 local method=$1
 local endpoint=$2
 local data=$3
 local expected_status=$4

 echo -n "Testing $method $endpoint ... "

 if [ -z "$data" ]; then
 response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
 -H "Content-Type: application/json")
 else
 response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
 -H "Content-Type: application/json" \
 -d "$data")
 fi

 status=$(echo "$response" | tail -n1)
 body=$(echo "$response" | head -n-1)

 if [ "$status" == "$expected_status" ] || [ -z "$expected_status" ]; then
 echo -e "${GREEN} Status: $status${NC}"
 if [ ! -z "$body" ] && [ "$body" != "null" ]; then
 echo " Response: $(echo $body | head -c 100)..."
 fi
 else
 echo -e "${RED} Expected $expected_status, got $status${NC}"
 echo " Response: $body"
 fi
 echo ""
}

# Check if server is running
echo "Checking server health..."
if ! curl -s $HEALTH_URL/health > /dev/null 2>&1; then
 echo -e "${RED}ERROR: Server is not running on $HEALTH_URL${NC}"
 echo "Please start the backend with: mvn spring-boot:run"
 exit 1
fi
echo -e "${GREEN} Server is running${NC}"
echo ""

# Test HealthController
echo "========== HealthController =========="
test_endpoint "GET" "/health" "" "200"

# Test AuthController
echo "========== AuthController =========="
test_endpoint "POST" "/auth/register" '{
 "email": "test@example.com",
 "password": "password123",
 "first_name": "Test",
 "last_name": "User"
}' "201"

test_endpoint "POST" "/auth/login" '{
 "email": "test@example.com",
 "password": "password123"
}' "200"

test_endpoint "POST" "/auth/refresh" '{
 "refresh_token": "refresh_token_xyz"
}' "200"

# Test UserController
echo "========== UserController =========="
test_endpoint "GET" "/users" "" "200"

test_endpoint "GET" "/users/user-001" "" ""

test_endpoint "POST" "/users" '{
 "first_name": "John",
 "last_name": "Doe",
 "email": "john.doe@example.com",
 "password": "password123",
 "phone_number": "+1-555-0001"
}' "201"

# Test CampCardController
echo "========== CampCardController =========="
test_endpoint "GET" "/camp-cards" "" "200"

test_endpoint "GET" "/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/wallet" "" "200"

test_endpoint "POST" "/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/issue-card" '{
 "card_holder_name": "Test User",
 "card_type": "PREMIUM",
 "subscription_type": "MONTHLY",
 "subscription_price": 9.99
}' "201"

# Test MerchantsController
echo "========== MerchantsController =========="
test_endpoint "GET" "/merchants" "" "200"

test_endpoint "POST" "/merchants" '{
 "business_name": "Test Restaurant",
 "category": "DINING",
 "description": "A test restaurant",
 "website_url": "https://example.com",
 "phone_number": "+1-555-1000",
 "email": "contact@example.com"
}' "201"

test_endpoint "GET" "/merchants/nearby?latitude=40.7128&longitude=-74.0060&radius_km=5" "" "200"

# Test OffersController
echo "========== OffersController =========="
test_endpoint "GET" "/offers" "" "200"

test_endpoint "GET" "/offers?category=DINING" "" "200"

test_endpoint "GET" "/debug" "" "200"

# Test SettingsController
echo "========== SettingsController =========="
test_endpoint "GET" "/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings" "" "200"

test_endpoint "PUT" "/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings/notifications" '{
 "notifications_enabled": true,
 "push_notifications_enabled": true,
 "quiet_hours_start": "22:00",
 "quiet_hours_end": "07:00"
}' "200"

test_endpoint "POST" "/users/43f8ed30-fcef-4abc-bf79-67d57836e5d2/settings/toggle-notifications" '{
 "enabled": false
}' "200"

echo "=========================================="
echo "Test Suite Complete"
echo "=========================================="
