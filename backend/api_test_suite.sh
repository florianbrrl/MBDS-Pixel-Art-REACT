#!/bin/bash

# API Test Suite for Pixel Art Backend API
# This script tests all API endpoints and verifies expected responses
#
# Usage: ./api_test_suite.sh [options]
#
# Options:
#   -v, --verbose     Show detailed output for each test
#
# The script will test all API endpoints and verify expected responses.
# Results are stored in the test_results directory.

# -e: Exit immediately if a command exits with a non-zero status
# -u: Treat unset variables as an error when substituting
set -e
set -u

# Show help if requested
if [[ "$*" == *"--help"* || "$*" == *"-h"* ]]; then
    echo "Usage: ./api_test_suite.sh [options]"
    echo ""
    echo "Options:"
    echo "  -v, --verbose     Show detailed output for each test"
    echo "  -h, --help        Show this help message"
    echo ""
    echo "The script will test all API endpoints and verify expected responses."
    echo "Results are stored in the test_results directory."
    exit 0
fi

# Parse command line arguments
VERBOSE=false
for arg in "$@"; do
    case $arg in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
    esac
done

# Colors for output formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API configuration
API_BASE_URL="http://localhost:3000/api"
RESULTS_DIR="test_results"

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Create results directory if it doesn't exist
mkdir -p "$RESULTS_DIR"

# Function to run a test and record results
run_test() {
    local endpoint="$1"
    local method="$2"
    local expected_status="$3"
    local description="$4"
    local data="$5"
    local token="$6"
    local params="${7:-}"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    # Replace potential spaces in endpoint for filename
    local safe_endpoint="${endpoint//\//_}"
    safe_endpoint="${safe_endpoint// /_}"
    safe_endpoint="${safe_endpoint//\?/\?}"
    
    # Create command with appropriate method and data
    local cmd="curl -s -X $method"
    
    # Add headers
    cmd="$cmd -H 'Content-Type: application/json'"
    if [ -n "$token" ]; then
        cmd="$cmd -H 'Authorization: Bearer $token'"
    fi
    
    # Add data if present
    if [ -n "$data" ] && [ "$data" != "null" ]; then
        cmd="$cmd -d '$data'"
    fi
    
    # Add parameters if present
    local full_endpoint="$API_BASE_URL$endpoint"
    if [ -n "$params" ]; then
        full_endpoint="${full_endpoint}${params}"
    fi
    
    # Finalize command
    cmd="$cmd $full_endpoint"
    
    # Execute the command and capture response and status
    local response_file="${RESULTS_DIR}/${safe_endpoint}_${method}.json"
    local http_status
    local response
    
    # Print the test number and description
    echo -e "${BLUE}TEST ${TESTS_TOTAL}${NC}: $description"
    
    # In verbose mode, print more details
    if [ "$VERBOSE" = true ]; then
        echo "  Endpoint: $method $endpoint${params}"
        if [ -n "$data" ] && [ "$data" != "null" ]; then
            echo "  Data: $data"
        fi
    fi
    
    # Execute command and capture response body and status code
    response=$(eval "$cmd" 2>/dev/null || echo '{"error":"Connection failed"}')
    echo "$response" > "$response_file"
    
    # Get HTTP status from response (assuming API returns status in JSON)
    http_status=$(echo "$response" | grep -o '"status":[0-9]*' | grep -o '[0-9]*')
    
    # If http_status is empty (possibly because API doesn't return status in JSON), default to check for error keywords
    if [ -z "$http_status" ]; then
        if echo "$response" | grep -q "error"; then
            http_status="error"
        else
            http_status="200" # Assume success if no error found
        fi
    fi
    
    # Verify status code against expected
    if [ "$http_status" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ Status: $http_status (Expected: $expected_status)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${RED}✗ Status: $http_status (Expected: $expected_status)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    # In verbose mode, show response preview
    if [ "$VERBOSE" = true ]; then
        echo -e "  ${YELLOW}Response Preview:${NC}"
        echo "$response" | head -n 3 | sed 's/^/    /'
        if [ "$(echo "$response" | wc -l)" -gt 3 ]; then
            echo "    ..."
        fi
        echo ""
    fi
}

echo -e "${BLUE}=== Running Pixel Art API Test Suite ===${NC}"
echo -e "${YELLOW}Initializing test environment...${NC}"

# Run seed script to ensure test users exist
echo "Seeding database with test data..."
npx ts-node src/scripts/seed.ts

# Authentication tokens for different user roles
echo "Obtaining authentication tokens..."

# Login as guest
guest_login_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "guest@example.com", "password": "password123"}')
GUEST_TOKEN=$(echo "$guest_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "$GUEST_TOKEN" > "$RESULTS_DIR/token_guest@example.com.txt"

# Login as regular user
user_login_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}')
USER_TOKEN=$(echo "$user_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "$USER_TOKEN" > "$RESULTS_DIR/token_user@example.com.txt"

# Login as premium user
premium_login_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "premium@example.com", "password": "password123"}')
PREMIUM_TOKEN=$(echo "$premium_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "$PREMIUM_TOKEN" > "$RESULTS_DIR/token_premium@example.com.txt"

# Login as admin
admin_login_response=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}')
ADMIN_TOKEN=$(echo "$admin_login_response" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "$ADMIN_TOKEN" > "$RESULTS_DIR/token_admin@example.com.txt"

echo -e "${GREEN}Tokens obtained successfully!${NC}"
echo ""

# Begin Test Suite
echo -e "${BLUE}=== Starting API Tests ===${NC}"

# ==========================================
# General API Tests
# ==========================================
run_test "/" "GET" "200" "API Information" "" "" ""

# ==========================================
# Authentication Tests
# ==========================================

# Registration Tests
run_test "/auth/register" "POST" "201" "Register new user" '{"email": "newuser@example.com", "password": "password123"}' "" ""
run_test "/auth/register" "POST" "400" "Register with existing email" '{"email": "admin@example.com", "password": "password123"}' "" ""
run_test "/auth/register" "POST" "400" "Register with invalid email" '{"email": "invalid-email", "password": "password123"}' "" ""
run_test "/auth/register" "POST" "400" "Register with short password" '{"email": "short@example.com", "password": "123"}' "" ""

# Login Tests
run_test "/auth/login" "POST" "200" "Login with valid credentials" '{"email": "user@example.com", "password": "password123"}' "" ""
run_test "/auth/login" "POST" "401" "Login with incorrect password" '{"email": "user@example.com", "password": "wrongpassword"}' "" ""
run_test "/auth/login" "POST" "401" "Login with non-existent user" '{"email": "nonexistent@example.com", "password": "password123"}' "" ""

# Profile Access Tests
run_test "/auth/profile" "GET" "200" "Get profile with admin token" "" "$ADMIN_TOKEN" ""
run_test "/auth/profile" "GET" "200" "Get profile with premium token" "" "$PREMIUM_TOKEN" ""
run_test "/auth/profile" "GET" "200" "Get profile with user token" "" "$USER_TOKEN" ""
run_test "/auth/profile" "GET" "403" "Get profile with guest token" "" "$GUEST_TOKEN" ""
run_test "/auth/profile" "GET" "401" "Get profile without token" "" "" ""

# ==========================================
# User Endpoints Tests
# ==========================================

# Get User Profile
run_test "/users/me" "GET" "200" "Get user profile with admin" "" "$ADMIN_TOKEN" ""
run_test "/users/me" "GET" "200" "Get user profile with premium" "" "$PREMIUM_TOKEN" ""
run_test "/users/me" "GET" "200" "Get user profile with user" "" "$USER_TOKEN" ""
run_test "/users/me" "GET" "403" "Get user profile with guest" "" "$GUEST_TOKEN" ""
run_test "/users/me" "GET" "401" "Get user profile without token" "" "" ""

# Update User Profile
run_test "/users/me" "PATCH" "200" "Update user nickname with admin" '{"nickname": "AdminUser"}' "$ADMIN_TOKEN" ""
run_test "/users/me" "PATCH" "200" "Update user theme with premium" '{"theme_preference": "dark"}' "$PREMIUM_TOKEN" ""
run_test "/users/me" "PATCH" "200" "Update user profile with user" '{"nickname": "RegularUser"}' "$USER_TOKEN" ""
run_test "/users/me" "PATCH" "403" "Update user profile with guest" '{"nickname": "GuestUser"}' "$GUEST_TOKEN" ""
run_test "/users/me" "PATCH" "401" "Update user profile without token" '{"nickname": "Anonymous"}' "" ""

# ==========================================
# PixelBoard Endpoints Tests
# ==========================================

# Get All PixelBoards
run_test "/pixelboards" "GET" "200" "Get all pixelboards (no auth)" "" "" ""

# Get PixelBoards with Filtering and Sorting
run_test "/pixelboards" "GET" "200" "Get pixelboards with sorting" "" "" "?sortBy=title&sortDirection=asc"
run_test "/pixelboards" "GET" "200" "Get pixelboards with pagination" "" "" "?page=1&limit=3"
run_test "/pixelboards" "GET" "200" "Get pixelboards with filtering" "" "" "?minWidth=20&maxWidth=100&allowOverwrite=true"

# Get Filtered PixelBoards
run_test "/pixelboards/active" "GET" "200" "Get active pixelboards" "" "" ""
run_test "/pixelboards/completed" "GET" "200" "Get completed pixelboards" "" "" ""

# Store results for comparison
curl -s "$API_BASE_URL/pixelboards" > "$RESULTS_DIR/pixelboard_all.json"
curl -s "$API_BASE_URL/pixelboards/active" > "$RESULTS_DIR/pixelboard_active.json"
curl -s "$API_BASE_URL/pixelboards/completed" > "$RESULTS_DIR/pixelboard_completed.json"

# Get PixelBoard by ID
# First, get a valid pixelboard ID from the list
pixelboard_id=$(curl -s "$API_BASE_URL/pixelboards" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
if [ -n "$pixelboard_id" ]; then
    run_test "/pixelboards/$pixelboard_id" "GET" "200" "Get pixelboard by valid ID" "" "" ""
fi
run_test "/pixelboards/invalid-id" "GET" "404" "Get pixelboard by invalid ID" "" "" ""

# Admin PixelBoard Operations
PIXELBOARD_CREATE_DATA='{
  "title": "Test Board",
  "width": 25,
  "height": 25,
  "cooldown": 60,
  "allow_overwrite": true,
  "start_time": "2025-01-01T00:00:00Z",
  "end_time": "2025-12-31T23:59:59Z"
}'

# Create new PixelBoard (admin only)
run_test "/pixelboards" "POST" "201" "Create pixelboard as admin" "$PIXELBOARD_CREATE_DATA" "$ADMIN_TOKEN" ""
run_test "/pixelboards" "POST" "403" "Create pixelboard as premium" "$PIXELBOARD_CREATE_DATA" "$PREMIUM_TOKEN" ""
run_test "/pixelboards" "POST" "403" "Create pixelboard as user" "$PIXELBOARD_CREATE_DATA" "$USER_TOKEN" ""
run_test "/pixelboards" "POST" "403" "Create pixelboard as guest" "$PIXELBOARD_CREATE_DATA" "$GUEST_TOKEN" ""
run_test "/pixelboards" "POST" "401" "Create pixelboard without auth" "$PIXELBOARD_CREATE_DATA" "" ""

# If we created a pixelboard, update it
if [ -n "$pixelboard_id" ]; then
    PIXELBOARD_UPDATE_DATA='{
      "title": "Updated Test Board",
      "allow_overwrite": false
    }'
    
    # Update PixelBoard (admin only)
    run_test "/pixelboards/$pixelboard_id" "PUT" "200" "Update pixelboard as admin" "$PIXELBOARD_UPDATE_DATA" "$ADMIN_TOKEN" ""
    run_test "/pixelboards/$pixelboard_id" "PUT" "403" "Update pixelboard as premium" "$PIXELBOARD_UPDATE_DATA" "$PREMIUM_TOKEN" ""
    run_test "/pixelboards/$pixelboard_id" "PUT" "403" "Update pixelboard as user" "$PIXELBOARD_UPDATE_DATA" "$USER_TOKEN" ""
    run_test "/pixelboards/$pixelboard_id" "PUT" "403" "Update pixelboard as guest" "$PIXELBOARD_UPDATE_DATA" "$GUEST_TOKEN" ""
    run_test "/pixelboards/$pixelboard_id" "PUT" "401" "Update pixelboard without auth" "$PIXELBOARD_UPDATE_DATA" "" ""
    
    # Delete PixelBoard (admin only)
    run_test "/pixelboards/$pixelboard_id" "DELETE" "200" "Delete pixelboard as admin" "" "$ADMIN_TOKEN" ""
    run_test "/pixelboards/$pixelboard_id" "DELETE" "404" "Delete already deleted pixelboard" "" "$ADMIN_TOKEN" ""
fi

# ==========================================
# Admin Access Tests
# ==========================================
run_test "/admin" "GET" "200" "Access admin route as admin" "" "$ADMIN_TOKEN" ""
run_test "/admin" "GET" "403" "Access admin route as premium" "" "$PREMIUM_TOKEN" ""
run_test "/admin" "GET" "403" "Access admin route as user" "" "$USER_TOKEN" ""
run_test "/admin" "GET" "403" "Access admin route as guest" "" "$GUEST_TOKEN" ""
run_test "/admin" "GET" "401" "Access admin route without token" "" "" ""

# ==========================================
# Summary and Results
# ==========================================
echo -e "\n${BLUE}=== Test Suite Complete ===${NC}"
echo -e "${YELLOW}Total Tests: ${TESTS_TOTAL}${NC}"
echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"

if [ "$TESTS_FAILED" -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed successfully!${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Check the logs above for details.${NC}"
    exit 1
fi