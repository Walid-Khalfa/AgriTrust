#!/bin/bash

echo "Testing Hedera credentials with simple balance query..."
echo ""

# Get Supabase URL from .env or use default
SUPABASE_URL="https://mrbfrwtymikayrbrzgmp.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzU5NzksImV4cCI6MjA1MzU1MTk3OX0.Uo-aPKpfqWWqnDGqwKqjRqjqPQqjqPQqjqPQqjqPQqg"

echo "Calling test-hedera-simple Edge Function..."
echo ""

curl -i -X POST \
  "${SUPABASE_URL}/functions/v1/test-hedera-simple" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{}'

echo ""
echo ""
echo "Check the response above for:"
echo "1. Key parsing method (DER/ED25519/ECDSA)"
echo "2. Public key derived from private key"
echo "3. Account balance (confirms credentials work)"
echo ""
echo "If you see 'success: true', your credentials are correct!"
echo "If you see errors, check the Supabase Edge Function logs for details."
