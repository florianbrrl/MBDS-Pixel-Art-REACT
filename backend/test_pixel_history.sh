#\!/bin/bash

# Set up API URL and other variables
API_URL="http://localhost:3000/api"

# Get an admin token
ADMIN_TOKEN=$(cat ./test_results/token_admin@example.com.txt 2>/dev/null || echo "")
if [ -z "$ADMIN_TOKEN" ]; then
  echo "No admin token found. Make sure to run the full test suite first."
  exit 1
fi

# Get the active pixelboards and select the first one for testing
ACTIVE_BOARDS=$(curl -s $API_URL/pixelboards/active)
PIXEL_BOARD_ID=$(echo $ACTIVE_BOARDS | jq -r '.data[0].id')

echo "Using pixelboard ID: $PIXEL_BOARD_ID for pixel history tests"

# Place a few pixels to ensure we have history
for i in {1..3}; do
  X=$((RANDOM % 10))
  Y=$((RANDOM % 10))
  COLOR="#$(openssl rand -hex 3)"
  
  echo "Placing pixel at ($X,$Y) with color $COLOR"
  curl -s -X POST $API_URL/pixelboards/$PIXEL_BOARD_ID/pixel \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"x\": $X, \"y\": $Y, \"color\": \"$COLOR\"}"
  
  sleep 1
done

# Test getting board history
echo -e "\nTesting: Get board history"
RESPONSE=$(curl -s -X GET $API_URL/pixelboards/$PIXEL_BOARD_ID/history)
echo $RESPONSE | jq .

# Test getting position history
X=3
Y=3
# First place a pixel at this specific location
echo -e "\nPlacing pixel at fixed position ($X,$Y)"
curl -s -X POST $API_URL/pixelboards/$PIXEL_BOARD_ID/pixel \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"x\": $X, \"y\": $Y, \"color\": \"#FF00FF\"}"

# Test position history
echo -e "\nTesting: Get position history"
RESPONSE=$(curl -s -X GET "$API_URL/pixelboards/$PIXEL_BOARD_ID/position-history?x=$X&y=$Y")
echo $RESPONSE | jq .

# Test invalid coordinates
echo -e "\nTesting: Get position history with invalid coordinates"
RESPONSE=$(curl -s -X GET "$API_URL/pixelboards/$PIXEL_BOARD_ID/position-history?x=invalid&y=5")
echo $RESPONSE | jq .

# Test missing coordinates
echo -e "\nTesting: Get position history with missing coordinates"
RESPONSE=$(curl -s -X GET "$API_URL/pixelboards/$PIXEL_BOARD_ID/position-history")
echo $RESPONSE | jq .

# Test invalid board ID
echo -e "\nTesting: Get history with invalid board ID"
RESPONSE=$(curl -s -X GET "$API_URL/pixelboards/invalid-id/history")
echo $RESPONSE | jq .

echo -e "\nPixel history tests completed"
