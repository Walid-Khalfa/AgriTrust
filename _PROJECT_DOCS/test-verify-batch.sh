#!/bin/bash

echo "=== Test 1: Vérification de la fonction Edge Function (OPTIONS) ==="
curl -i -X OPTIONS 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch'

echo -e "\n\n=== Test 2: Vérification sans auth (doit retourner 401) ==="
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -d '{"tokenId":"0.0.7155752","serialNumber":"1"}'

echo -e "\n\n=== Test 3: Vérification avec anon key ==="
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0' \
  -d '{"tokenId":"0.0.7155752","serialNumber":"1"}'

echo -e "\n\n=== Test 4: Vérification avec apikey ==="
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0' \
  -d '{"tokenId":"0.0.7155752","serialNumber":"1"}'
