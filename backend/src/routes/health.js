import { Router } from 'express';
import axios from 'axios';
import { env } from '../utils/config.js';
import { supabase } from '../db.js';
import { healthCheck as geminiHealthCheck } from '../ai/gemini.js';

const router = Router();

/**
 * Simple ping endpoint for quick health checks
 * Returns immediately without external dependencies
 */
router.get('/health/ping', (_req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 4000,
    timestamp: new Date().toISOString()
  });
});

/**
 * Database health check endpoint with comprehensive diagnostics
 * Tests connection to Supabase and verifies batches table exists
 */
router.get('/health/db', async (_req, res) => {
  const out = {
    ok: false,
    env: {
      url_ok: !!env.SUPABASE_URL,
      service_role_present: !!env.SUPABASE_SERVICE_ROLE_KEY,
      service_role_length: env.SUPABASE_SERVICE_ROLE_KEY.length,
      service_role_prefix: env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 3)
    }
  };

  try {
    // REST probe (catches "Invalid API key")
    await axios.get(`${env.SUPABASE_URL}/rest/v1/batches?select=id&limit=1`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      timeout: 5000
    });

    const { error } = await supabase
      .from('batches')
      .select('id', { head: true, count: 'exact' });

    if (error) throw error;

    out.ok = true;
    return res.json(out);
  } catch (e) {
    out.error = e?.message || String(e);
    out.code = e?.code ?? null;

    if (out.env.service_role_length < 100 || out.env.service_role_prefix !== 'eyJ') {
      out.hint = 'Using a short/legacy key. Set the long Service Role Secret (JWT) in backend env and restart.';
    } else if (String(out.error).includes('Invalid API key')) {
      out.hint = 'Key invalid for this project. Copy the Service Role Secret from the SAME Supabase project.';
    } else if (out.code === '42P01') {
      out.hint = "Missing table 'batches'. Run the schema SQL.";
    } else {
      out.hint = 'Check SUPABASE_URL and RLS policies.';
    }

    return res.status(500).json(out);
  }
});

/**
 * Full system health check
 * Tests Supabase Auth, REST API, Hedera Mirror Node, and Gemini AI
 */
router.get('/health/full', async (_req, res) => {
  const checks = {};

  // Check Supabase Auth
  try {
    const auth = await axios.get(`${env.SUPABASE_URL}/auth/v1/health`, {
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY },
      timeout: 5000
    });
    checks.supabase_auth = auth.data || true;
  } catch (e) {
    checks.supabase_auth_error = e.response?.data || e.message;
  }

  // Check Supabase REST API
  try {
    const rest = await axios.get(`${env.SUPABASE_URL}/rest/v1/batches?select=id&limit=1`, {
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      },
      timeout: 5000
    });
    checks.supabase_rest = Array.isArray(rest.data);
  } catch (e) {
    checks.supabase_rest_error = e.response?.data || e.message;
  }

  // Check Hedera Mirror Node
  try {
    const mirror = await axios.get(
      `${env.MIRROR_NODE_URL}/api/v1/topics/${env.HEDERA_TOPIC_ID}`,
      { timeout: 5000 }
    );
    checks.hedera_topic = !!mirror.data?.topic_id;
  } catch (e) {
    checks.hedera_error = e.response?.data || e.message;
  }

  // Check Gemini AI using our wrapper
  try {
    const geminiResult = await geminiHealthCheck();
    checks.gemini = geminiResult;
  } catch (e) {
    checks.gemini = { ok: false, error: e.message };
  }

  const ok = Object.keys(checks).every(k => !k.endsWith('_error'));
  return res.status(ok ? 200 : 500).json({ ok, checks });
});

export default router;
