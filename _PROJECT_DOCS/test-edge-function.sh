#!/bin/bash

# Test script for register-batch Edge Function
# Tests debug mode, dry-run mode, and validation

EDGE_FUNCTION_URL="https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/register-batch"

echo "🧪 Testing register-batch Edge Function"
echo "========================================"
echo ""

# Test 1: Debug mode
echo "📋 Test 1: Debug mode (x-debug: 1)"
echo "-----------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-debug: 1' \
  -d '{
    "productType": "Tomatoes",
    "quantity": "100",
    "location": "Farm A",
    "imageData": "https://example.com/image.jpg",
    "harvestDate": "28-10-2025"
  }'
echo -e "\n\n"

# Test 2: Dry-run mode with DD-MM-YYYY date
echo "📋 Test 2: Dry-run mode with DD-MM-YYYY date"
echo "---------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Carrots",
    "quantity": "50",
    "location": "Farm B",
    "imageData": "https://example.com/carrots.jpg",
    "harvestDate": "15-03-2025"
  }'
echo -e "\n\n"

# Test 3: Dry-run mode with YYYY-MM-DD date
echo "📋 Test 3: Dry-run mode with YYYY-MM-DD date"
echo "---------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Potatoes",
    "quantity": "200",
    "location": "Farm C",
    "imageData": "https://example.com/potatoes.jpg",
    "harvestDate": "2025-04-20"
  }'
echo -e "\n\n"

# Test 4: Invalid JSON
echo "📋 Test 4: Invalid JSON (should return 400)"
echo "-------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -d 'invalid json here'
echo -e "\n\n"

# Test 5: Missing required fields
echo "📋 Test 5: Missing required fields (should return 422)"
echo "-------------------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -d '{
    "productType": "Onions"
  }'
echo -e "\n\n"

# Test 6: Invalid date format (US format)
echo "📋 Test 6: Invalid date format - US format (should return 422)"
echo "---------------------------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Lettuce",
    "quantity": "75",
    "location": "Farm D",
    "imageData": "https://example.com/lettuce.jpg",
    "harvestDate": "10-28-2025"
  }'
echo -e "\n\n"

# Test 7: Invalid date - day out of range
echo "📋 Test 7: Invalid date - day 32 (should return 422)"
echo "-----------------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Spinach",
    "quantity": "30",
    "location": "Farm E",
    "imageData": "https://example.com/spinach.jpg",
    "harvestDate": "32-01-2025"
  }'
echo -e "\n\n"

# Test 8: Invalid date - February 30
echo "📋 Test 8: Invalid date - February 30 (should return 422)"
echo "----------------------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Cabbage",
    "quantity": "40",
    "location": "Farm F",
    "imageData": "https://example.com/cabbage.jpg",
    "harvestDate": "30-02-2025"
  }'
echo -e "\n\n"

# Test 9: Valid leap year date
echo "📋 Test 9: Valid leap year date - February 29, 2024"
echo "----------------------------------------------------"
curl -i -X POST "$EDGE_FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H 'x-dry-run: 1' \
  -d '{
    "productType": "Broccoli",
    "quantity": "60",
    "location": "Farm G",
    "imageData": "https://example.com/broccoli.jpg",
    "harvestDate": "29-02-2024"
  }'
echo -e "\n\n"

echo "✅ All tests completed!"
