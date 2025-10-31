import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTM1OTEzMSwiZXhwIjoyMDc2OTM1MTMxfQ.W9lUab8iggUK0EN9KfU5dP6iKpaw-PyPM7LQkmM9HU4';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Testing Supabase connection...');

// Test 1: List tables
const { data: tables, error: tablesError } = await supabase
  .from('batches')
  .select('*')
  .limit(1);

if (tablesError) {
  console.error('❌ Error querying batches table:', tablesError);
} else {
  console.log('✅ Successfully connected to Supabase');
  console.log('Tables query result:', tables);
}

// Test 2: Try insert
const testBatch = {
  batch_name: 'Test Batch',
  location: 'Test Location',
  photo_url: 'https://example.com/test.jpg',
  hcs_tx_id: 'test-tx-id',
  ai_analysis: { test: true }
};

const { data: insertData, error: insertError } = await supabase
  .from('batches')
  .insert([testBatch])
  .select()
  .single();

if (insertError) {
  console.error('❌ Insert error:', insertError);
} else {
  console.log('✅ Insert successful:', insertData);
}
