import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Ping all services in parallel with Promise.allSettled
    const results = await Promise.allSettled([
      // Check Supabase
      (async () => {
        const start = Date.now();
        const { error } = await supabaseClient.from('batches').select('id').limit(1);
        return { ok: !error, ms: Date.now() - start };
      })(),
      
      // Check Hedera (via environment variables presence)
      (async () => {
        const start = Date.now();
        const hederaOk = !!(Deno.env.get('HEDERA_ACCOUNT_ID') && Deno.env.get('HEDERA_PRIVATE_KEY'));
        return { ok: hederaOk, ms: Date.now() - start };
      })(),
      
      // Check Gemini AI (via environment variable presence)
      (async () => {
        const start = Date.now();
        const geminiOk = !!Deno.env.get('GEMINI_API_KEY');
        return { ok: geminiOk, ms: Date.now() - start };
      })()
    ]);

    const [supabaseResult, hederaResult, geminiResult] = results;

    const supabaseHealth = supabaseResult.status === 'fulfilled' ? supabaseResult.value : { ok: false, ms: 0 };
    const hederaHealth = hederaResult.status === 'fulfilled' ? hederaResult.value : { ok: false, ms: 0 };
    const geminiHealth = geminiResult.status === 'fulfilled' ? geminiResult.value : { ok: false, ms: 0 };

    const allHealthy = supabaseHealth.ok && hederaHealth.ok && geminiHealth.ok;

    return new Response(
      JSON.stringify({
        ok: true,
        status: allHealthy ? 'healthy' : 'degraded',
        services: {
          supabase: supabaseHealth,
          hedera: hederaHealth,
          gemini: geminiHealth
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Dashboard health error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: 'Failed to check service health',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
