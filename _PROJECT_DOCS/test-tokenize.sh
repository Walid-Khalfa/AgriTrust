#!/bin/bash

# Load environment variables
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
elif [ -f .env.example ]; then
  export $(grep -v '^#' .env.example | xargs)
fi

echo "Testing tokenize-batch Edge Function..."
echo "URL: https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/tokenize-batch"
echo ""

curl -X POST "https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/tokenize-batch" \
  -H "apikey: ${VITE_SUPABASE_ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"hcsTransactionIds":["0.0.7127337@1761723407.969114729"]}' \
  -w "\n\nHTTP Status: %{http_code}\n"

echo ""
