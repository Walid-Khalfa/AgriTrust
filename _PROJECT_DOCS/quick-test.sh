#!/bin/bash

# Quick test script with hardcoded values
# Use this for quick testing without .env file

export SUPABASE_URL="https://mrbfrwtymikayrbrzgmp.supabase.co"
export SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0"

# Run the test script
./test-register-ui.sh "$@"
