#!/bin/bash

SUPABASE_URL="https://gvqvdqtbqxbdqxqfvxqy.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2cXZkcXRicXhiZHF4cWZ2eHF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc4MjE3MzQsImV4cCI6MjA1MzM5NzczNH0.Uh1Yz1Yz-Yz1Yz1Yz1Yz1Yz1Yz1Yz1Yz1Yz1Yz1Yz"

echo "=== Testing dashboard-stats ==="
curl -s -X GET "${SUPABASE_URL}/functions/v1/dashboard-stats" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n=== Testing dashboard-health ==="
curl -s -X GET "${SUPABASE_URL}/functions/v1/dashboard-health" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" | jq '.'
