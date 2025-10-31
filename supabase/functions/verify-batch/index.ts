import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  tokenId: string;
  serialNumber: string | number;
}

// Helper to create JSON responses with CORS
function json(status: number, body: any) {
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

serve(async (req) => {
  // Log request (filter sensitive headers)
  const headers = Object.fromEntries(req.headers.entries());
  const safeHeaders = { ...headers };
  if (safeHeaders.authorization) safeHeaders.authorization = 'Bearer ***';
  if (safeHeaders.apikey) safeHeaders.apikey = '***';
  
  console.log('=== VERIFY-BATCH REQUEST ===');
  console.log('Method:', req.method);
  console.log('Headers:', safeHeaders);
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    console.log('→ OPTIONS preflight OK');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse and validate body
    let body: RequestBody;
    try {
      body = await req.json();
    } catch (_) {
      console.error('→ Invalid JSON');
      return json(400, { stage: 'validation', error: 'Invalid JSON body' });
    }

    const { tokenId, serialNumber } = body;
    console.log('Body:', { tokenId, serialNumber });

    if (!tokenId || !serialNumber) {
      console.error('→ Missing required fields');
      return json(400, { 
        stage: 'validation',
        error: 'tokenId and serialNumber are required',
        received: body
      });
    }

    // Create Supabase client with SERVICE_ROLE_KEY to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('→ Missing environment variables');
      return json(500, { 
        stage: 'config',
        error: 'Server configuration error',
        details: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('→ Supabase client created (service role)');

    // Query batches table with maybeSingle() to handle no-row case
    console.log(`→ Querying batches: ${tokenId} #${serialNumber}`);
    const { data: batch, error: batchError } = await supabase
      .from('batches')
      .select('*')
      .eq('hedera_token_id', tokenId)
      .eq('hedera_serial_number', Number(serialNumber))
      .maybeSingle();

    if (batchError) {
      console.error('→ Database error:', batchError.message);
      return json(500, { 
        stage: 'database_query',
        error: 'Database query failed',
        details: batchError.message
      });
    }

    if (!batch) {
      console.log('→ NFT not found (404)');
      return json(404, { 
        stage: 'database_query',
        error: 'NFT not found or not registered in our system',
        verified: false
      });
    }

    console.log('→ Batch found:', batch.id);

    // Fetch HCS messages
    const hcsTransactionIds = batch.hcs_transaction_ids || [];
    console.log('→ Fetching HCS messages:', hcsTransactionIds.length);

    const { data: hcsMessages, error: hcsError } = await supabase
      .from('hcs_timeline')
      .select('*')
      .in('transaction_id', hcsTransactionIds)
      .order('timestamp', { ascending: true });

    if (hcsError) {
      console.warn('→ HCS query warning (non-fatal):', hcsError.message);
    }

    // Build response
    const response = {
      success: true,
      cached: false,
      tokenId: batch.hedera_token_id,
      serialNumber: batch.hedera_serial_number,
      status: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      nftMetadata: {
        id: batch.id,
        batchNumber: batch.batch_number,
        productType: batch.product_type,
        quantity: batch.quantity,
        harvestDate: batch.harvest_date,
        location: batch.location,
        certifications: batch.certifications,
        createdAt: batch.created_at,
        mintedAt: batch.tokenized_at,
      },
      hcsTransactionIds,
      hcsMessages: hcsMessages || [],
      ai_summary: batch.ai_provenance_summary || null,
    };

    console.log('→ Success (200)');
    return json(200, response);

  } catch (error: any) {
    console.error('=== EXCEPTION ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    return json(500, { 
      stage: 'exception',
      error: 'Internal server error', 
      details: error.message
    });
  }
});
