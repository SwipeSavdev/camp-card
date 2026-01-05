#!/bin/bash
# ============================================================================
# Camp Card - Initial Admin User Setup Script
# Run this ONCE after first deployment to create the admin user
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  Camp Card - Admin User Setup${NC}"
echo -e "${GREEN}============================================${NC}"

# Check if API is running
API_URL="${API_URL:-http://localhost:7010}"

echo -e "\n${YELLOW}Checking API availability at ${API_URL}...${NC}"
if ! curl -s "${API_URL}/actuator/health" > /dev/null; then
    echo -e "${RED}ERROR: API is not running at ${API_URL}${NC}"
    echo "Please start the backend first."
    exit 1
fi
echo -e "${GREEN}API is running!${NC}"

# Prompt for admin details
echo -e "\n${YELLOW}Enter admin user details:${NC}"

read -p "Admin Email [admin@campcard.org]: " ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-admin@campcard.org}

read -p "Admin First Name [Admin]: " ADMIN_FIRST_NAME
ADMIN_FIRST_NAME=${ADMIN_FIRST_NAME:-Admin}

read -p "Admin Last Name [User]: " ADMIN_LAST_NAME
ADMIN_LAST_NAME=${ADMIN_LAST_NAME:-User}

# Secure password input
while true; do
    read -s -p "Admin Password (min 8 chars, 1 uppercase, 1 number): " ADMIN_PASSWORD
    echo

    # Validate password
    if [[ ${#ADMIN_PASSWORD} -lt 8 ]]; then
        echo -e "${RED}Password must be at least 8 characters${NC}"
        continue
    fi

    if ! [[ "$ADMIN_PASSWORD" =~ [A-Z] ]]; then
        echo -e "${RED}Password must contain at least 1 uppercase letter${NC}"
        continue
    fi

    if ! [[ "$ADMIN_PASSWORD" =~ [0-9] ]]; then
        echo -e "${RED}Password must contain at least 1 number${NC}"
        continue
    fi

    read -s -p "Confirm Password: " ADMIN_PASSWORD_CONFIRM
    echo

    if [[ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD_CONFIRM" ]]; then
        echo -e "${RED}Passwords do not match${NC}"
        continue
    fi

    break
done

echo -e "\n${YELLOW}Creating admin user...${NC}"

# Create the admin user via registration endpoint
RESPONSE=$(curl -s -X POST "${API_URL}/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"${ADMIN_EMAIL}\",
        \"password\": \"${ADMIN_PASSWORD}\",
        \"firstName\": \"${ADMIN_FIRST_NAME}\",
        \"lastName\": \"${ADMIN_LAST_NAME}\",
        \"role\": \"SCOUT\"
    }")

# Check if registration succeeded
if echo "$RESPONSE" | grep -q "accessToken"; then
    echo -e "${GREEN}User registered successfully!${NC}"

    # Extract user ID from response
    USER_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

    echo -e "\n${YELLOW}Upgrading user to NATIONAL_ADMIN role...${NC}"

    # Update role directly in database
    # This requires DB access - we'll provide SQL command
    echo -e "${YELLOW}Run this SQL command to upgrade the user to admin:${NC}"
    echo -e "${GREEN}UPDATE users SET role = 'NATIONAL_ADMIN' WHERE email = '${ADMIN_EMAIL}';${NC}"

    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}  Admin User Created Successfully!${NC}"
    echo -e "${GREEN}============================================${NC}"
    echo -e "Email: ${ADMIN_EMAIL}"
    echo -e "Role: NATIONAL_ADMIN (after running SQL update)"
    echo -e "\n${YELLOW}IMPORTANT: Run the SQL command above to complete admin setup${NC}"
else
    echo -e "${RED}Failed to create admin user:${NC}"
    echo "$RESPONSE"
    exit 1
fi
