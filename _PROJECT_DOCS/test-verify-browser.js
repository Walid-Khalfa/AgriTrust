// Test verify-batch from browser console
// Copy-paste this into browser DevTools console

async function testVerifyBatch() {
  const SUPABASE_URL = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcyNDYsImV4cCI6MjA1MzEzMzI0Nn0.YOUR_ANON_KEY';

  console.log('🧪 Testing verify-batch Edge Function...\n');

  // Test 1: OPTIONS (CORS preflight)
  console.log('1️⃣ Testing OPTIONS (CORS)...');
  try {
    const optionsRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-batch`, {
      method: 'OPTIONS',
      headers: { 'apikey': ANON_KEY }
    });
    console.log(`✅ OPTIONS: ${optionsRes.status} ${optionsRes.statusText}`);
  } catch (err) {
    console.error('❌ OPTIONS failed:', err.message);
  }

  // Test 2: Valid NFT (should exist in DB)
  console.log('\n2️⃣ Testing POST with valid NFT...');
  try {
    const validRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY
      },
      body: JSON.stringify({
        tokenId: '0.0.7161809',
        serialNumber: 1
      })
    });
    const validData = await validRes.json();
    console.log(`Status: ${validRes.status}`);
    console.log('Response:', validData);
    
    if (validRes.ok) {
      console.log('✅ Valid NFT verified successfully');
    } else if (validRes.status === 404 && validData.stage === 'database_query') {
      console.log('⚠️ NFT not found (404 business logic - expected if not in DB)');
    } else {
      console.error('❌ Unexpected response');
    }
  } catch (err) {
    console.error('❌ Valid NFT test failed:', err.message);
  }

  // Test 3: Invalid payload
  console.log('\n3️⃣ Testing POST with invalid payload...');
  try {
    const invalidRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY
      },
      body: JSON.stringify({})
    });
    const invalidData = await invalidRes.json();
    console.log(`Status: ${invalidRes.status}`);
    console.log('Response:', invalidData);
    
    if (invalidRes.status === 400 && invalidData.stage === 'validation') {
      console.log('✅ Invalid payload rejected correctly');
    } else {
      console.error('❌ Expected 400 validation error');
    }
  } catch (err) {
    console.error('❌ Invalid payload test failed:', err.message);
  }

  // Test 4: Missing apikey header
  console.log('\n4️⃣ Testing POST without apikey header...');
  try {
    const noKeyRes = await fetch(`${SUPABASE_URL}/functions/v1/verify-batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokenId: '0.0.7161809',
        serialNumber: 1
      })
    });
    const noKeyData = await noKeyRes.json();
    console.log(`Status: ${noKeyRes.status}`);
    console.log('Response:', noKeyData);
    
    if (noKeyRes.status === 401) {
      console.log('✅ Missing apikey rejected correctly (401)');
    } else {
      console.error('❌ Expected 401 unauthorized');
    }
  } catch (err) {
    console.error('❌ No apikey test failed:', err.message);
  }

  console.log('\n✅ All tests completed!');
}

// Run tests
testVerifyBatch();
