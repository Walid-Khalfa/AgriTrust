#!/bin/bash

# Test verify-batch avec apikey (requis même avec verify_jwt = false)
# Remplacez YOUR_ANON_KEY par votre clé anon Supabase

PROJECT_REF="mrbfrwtymikayrbrzgmp"
ANON_KEY="YOUR_ANON_KEY"
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/verify-batch"

echo "🧪 Test 1: OPTIONS (CORS preflight)"
curl -i -X OPTIONS "$FUNCTION_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, apikey"

echo -e "\n\n🧪 Test 2: POST avec apikey et données valides"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "tokenId": "0.0.5184926",
    "serialNumber": "1"
  }'

echo -e "\n\n🧪 Test 3: POST avec apikey et données manquantes"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{}'

echo -e "\n\n✅ Tests terminés"
echo "Vérifiez les codes de statut HTTP:"
echo "  - OPTIONS devrait retourner 200"
echo "  - POST valide devrait retourner 200 ou 404 (selon si le NFT existe)"
echo "  - POST invalide devrait retourner 400"
