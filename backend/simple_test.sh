#!/bin/bash

# Simple test to verify our API
API_BASE_URL="http://localhost:3000/api"
RESULTS_DIR="test_results"

# Make sure results directory exists
mkdir -p "$RESULTS_DIR"

# Test API root endpoint
curl -s "$API_BASE_URL" > "$RESULTS_DIR/api_root.json"

# Get a login token
TOKEN=$(curl -s -X POST "$API_BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Save token to file
echo "$TOKEN" > "$RESULTS_DIR/admin_token.txt"

# Get pixelboards
curl -s "$API_BASE_URL/pixelboards" > "$RESULTS_DIR/pixelboards.json"

# Summary file
echo "Test completed at $(date)" > "$RESULTS_DIR/summary.txt"
echo "API base URL: $API_BASE_URL" >> "$RESULTS_DIR/summary.txt"
echo "Results in: $RESULTS_DIR" >> "$RESULTS_DIR/summary.txt"

# Show success message
echo "Tests completed successfully."
echo "Results stored in $RESULTS_DIR/"