#!/bin/bash

# Test verify-batch POST with anon key
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -H 'apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0' \
  -d '{"tokenId":"0.0.7160672","serialNumber":"1"}'
