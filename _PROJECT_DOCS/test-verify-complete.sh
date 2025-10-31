#!/bin/bash

# Test complet de verify-batch après correctif
# Remplacez ANON_KEY par votre clé anon Supabase

PROJECT_REF="mrbfrwtymikayrbrzgmp"
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/verify-batch"
ANON_KEY="YOUR_ANON_KEY" # Remplacer par votre clé

echo "🧪 Test 1: OPTIONS (CORS preflight)"
curl -i -X OPTIONS "$FUNCTION_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

echo -e "\n\n🧪 Test 2: POST valide (NFT existant)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "tokenId": "0.0.7160982",
    "serialNumber": "1"
  }'

echo -e "\n\n🧪 Test 3: POST valide (NFT inexistant)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "tokenId": "0.0.9999999",
    "serialNumber": "999"
  }'

echo -e "\n\n🧪 Test 4: POST invalide (payload vide)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{}'

echo -e "\n\n✅ Tests terminés"
echo ""
echo "Résultats attendus:"
echo "  Test 1 (OPTIONS) → 200"
echo "  Test 2 (NFT existant) → 200 avec données complètes"
echo "  Test 3 (NFT inexistant) → 404 avec {verified: false}"
echo "  Test 4 (payload vide) → 400 avec {stage: 'validation'}"
