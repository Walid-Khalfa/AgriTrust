#!/bin/bash

# Test complet de verify-batch Edge Function
# Usage: ./test-verify-batch-complete.sh

set -e

SUPABASE_URL="https://mrbfrwtymikayrbrzgmp.supabase.co"
FUNCTION_URL="${SUPABASE_URL}/functions/v1/verify-batch"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0"

echo "🧪 Test complet verify-batch Edge Function"
echo "=========================================="
echo ""

# Test 1: OPTIONS (preflight CORS)
echo "📋 Test 1: OPTIONS (preflight CORS)"
echo "-----------------------------------"
curl -i -X OPTIONS "$FUNCTION_URL" 2>&1 | grep -E "(HTTP|access-control)"
echo ""
echo "✅ Attendu: HTTP/2 200 + access-control-allow-origin: *"
echo ""
sleep 2

# Test 2: POST sans Authorization (payload invalide)
echo "📋 Test 2: POST sans payload (validation error)"
echo "-----------------------------------------------"
curl -i -X POST "$FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -d '{}' 2>&1 | head -20
echo ""
echo "✅ Attendu: HTTP/2 400 + { stage: 'validation', error: '...' }"
echo ""
sleep 2

# Test 3: POST avec payload valide, sans Authorization
echo "📋 Test 3: POST avec payload valide (sans auth)"
echo "-----------------------------------------------"
curl -i -X POST "$FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -d '{"tokenId":"0.0.7160982","serialNumber":"1"}' 2>&1 | head -30
echo ""
echo "✅ Attendu: HTTP/2 200 ou 404 (NFT not found) - PAS 404 (route not found)"
echo ""
sleep 2

# Test 4: POST avec Authorization header
echo "📋 Test 4: POST avec Authorization (Bearer anon key)"
echo "----------------------------------------------------"
curl -i -X POST "$FUNCTION_URL" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{"tokenId":"0.0.7160982","serialNumber":"1"}' 2>&1 | head -30
echo ""
echo "✅ Attendu: HTTP/2 200 (si NFT existe) ou 404 (si NFT n'existe pas en DB)"
echo ""

echo ""
echo "🎯 Résumé des tests"
echo "==================="
echo ""
echo "Si vous voyez 404 sur TOUS les tests POST:"
echo "  → La fonction n'est PAS déployée"
echo "  → Solution: supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp"
echo ""
echo "Si vous voyez 200/400/404 (avec body JSON):"
echo "  → La fonction EST déployée et fonctionne"
echo "  → Vérifier les logs: supabase functions logs verify-batch --follow"
echo ""
echo "Logs attendus dans Supabase Dashboard:"
echo "  ==> VERIFY-BATCH REQUEST RECEIVED <=="
echo "  Method: POST"
echo "  Stage: Parsing request body"
echo ""
