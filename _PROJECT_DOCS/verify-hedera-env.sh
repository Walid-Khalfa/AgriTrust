#!/bin/bash

echo "=== Vérification des variables d'environnement Hedera ==="
echo ""

# Appel de la fonction test-hedera-simple
SUPABASE_URL="https://mrbfrwtymikayrbrzgmp.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NzU5NzksImV4cCI6MjA1MzU1MTk3OX0.Uo-aPKpfqWWqnDGqwKqjRqjqPQqjqPQqjqPQqjqPQqg"

echo "Test des credentials Hedera via Edge Function..."
echo ""

RESPONSE=$(curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/test-hedera-simple" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{}')

echo "Réponse:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Vérifier si succès
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Credentials Hedera valides!"
  echo ""
  echo "Maintenant, testez la tokenization depuis /tokenize"
else
  echo "❌ Erreur de credentials!"
  echo ""
  echo "ACTIONS À FAIRE:"
  echo "1. Allez dans Supabase Dashboard → Edge Functions → Settings → Secrets"
  echo "2. Vérifiez HEDERA_OPERATOR_KEY:"
  echo "   - Doit être une SEULE ligne continue"
  echo "   - Pas d'espaces avant/après"
  echo "   - Pas de retours à la ligne"
  echo "3. Vérifiez HEDERA_OPERATOR_ID:"
  echo "   - Format: 0.0.XXXXX"
  echo "4. Après modification, redéployez la fonction:"
  echo "   supabase functions deploy tokenize-batch"
fi
