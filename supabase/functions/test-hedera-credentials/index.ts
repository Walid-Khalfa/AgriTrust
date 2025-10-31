/**
 * Test Hedera credentials by querying account info
 * 
 * Auth Options:
 * 1. Public access (verify_jwt = false in config.toml):
 *    curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/test-hedera-credentials' \
 *      -H 'apikey: YOUR_ANON_KEY'
 * 
 * 2. Authenticated access (verify_jwt = true, default):
 *    curl -X POST 'https://YOUR_PROJECT.supabase.co/functions/v1/test-hedera-credentials' \
 *      -H 'apikey: YOUR_ANON_KEY' \
 *      -H 'Authorization: Bearer YOUR_USER_ACCESS_TOKEN'
 * 
 * Note: apikey header is ALWAYS required. Authorization header is required only if verify_jwt = true.
 * User access token comes from supabase.auth.getSession() on client side, NOT the anon key.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'
import { Client, AccountId, PrivateKey, AccountInfoQuery } from 'npm:@hashgraph/sdk@^2.49.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

/**
 * Detect and sanitize keys with hidden whitespace/newlines
 */
function sanitizeKey(raw: string): string {
  if (!raw) return raw
  
  // Detect problematic characters
  const hasNewlines = /[\r\n]/.test(raw)
  const hasExtraSpaces = /\s{2,}/.test(raw)
  
  if (hasNewlines || hasExtraSpaces) {
    console.warn('⚠️  Key contains whitespace/newlines - auto-cleaning')
  }
  
  // Remove all whitespace
  return raw.replace(/\s+/g, '')
}

/**
 * Parse private key from multiple formats
 */
function loadPrivateKeyAny(raw: string): PrivateKey {
  if (!raw) {
    throw new Error('Private key is required')
  }

  const cleanKey = sanitizeKey(raw).replace(/^0x/, '')

  try {
    // DER-encoded key (starts with 302e/3030/3081)
    if (/^(302e|3030|3081)/.test(cleanKey)) {
      console.log('🔑 Detected DER-encoded key')
      return PrivateKey.fromStringDer(cleanKey)
    }

    // 64 hex chars - Try ECDSA first, then ED25519
    if (/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
      console.log('🔑 Detected 64-char hex key')
      try {
        return PrivateKey.fromStringECDSA(cleanKey)
      } catch {
        return PrivateKey.fromStringED25519(cleanKey)
      }
    }

    // Fallback to generic parser
    return PrivateKey.fromString(cleanKey)
  } catch (error) {
    throw new Error(
      `Failed to parse key: ${error.message}\n` +
      `Key fingerprint: ${cleanKey.length} chars, starts with "${cleanKey.substring(0, 10)}..."`
    )
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const requestId = crypto.randomUUID?.() ?? `req_${Date.now()}`

  try {
    // Optional: Verify user authentication if verify_jwt = true in config.toml
    // When verify_jwt = false, Supabase handles apikey validation automatically
    // When verify_jwt = true, Supabase requires both apikey AND Authorization header
    const authHeader = req.headers.get('Authorization')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')
    
    let userId = null
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
      })
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.warn(`[${requestId}] Auth check failed:`, authError.message)
        // If verify_jwt = true in config.toml, Supabase will reject before reaching here
        // This is just for logging purposes
      } else if (user) {
        userId = user.id
        console.log(`[${requestId}] Authenticated user: ${userId}`)
      }
    }

    const operatorId = Deno.env.get('HEDERA_OPERATOR_ID')
    const operatorKey = Deno.env.get('HEDERA_OPERATOR_KEY')
    const topicId = Deno.env.get('HEDERA_TOPIC_ID')
    const submitKey = Deno.env.get('HEDERA_SUBMIT_KEY')
    const network = Deno.env.get('HEDERA_NETWORK') || 'testnet'

    if (!operatorId || !operatorKey) {
      return new Response(
        JSON.stringify({
          id: requestId,
          success: false,
          error: 'Missing credentials',
          message: 'HEDERA_OPERATOR_ID and HEDERA_OPERATOR_KEY must be set in Edge Function secrets'
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Parse credentials
    const accountId = AccountId.fromString(operatorId)
    const privateKey = loadPrivateKeyAny(operatorKey)

    // Initialize client for correct network
    const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet()
    client.setOperator(accountId, privateKey)

    console.log(`[${requestId}] 🔍 Testing credentials for ${operatorId} on ${network}...`)

    // Query account info to verify credentials work
    const accountInfo = await new AccountInfoQuery()
      .setAccountId(accountId)
      .execute(client)

    await client.close()

    // Redact sensitive info in response
    const keyFingerprint = `${privateKey.toString().substring(0, 10)}...${privateKey.toString().slice(-6)}`

    return new Response(
      JSON.stringify({
        id: requestId,
        success: true,
        network,
        account: {
          id: operatorId,
          balance: accountInfo.balance.toString(),
          keyType: accountInfo.key.toString().substring(0, 20) + '...',
          isDeleted: accountInfo.isDeleted
        },
        config: {
          topicId: topicId || 'Not set',
          hasSubmitKey: !!submitKey,
          operatorKeyFingerprint: keyFingerprint
        },
        userId: userId || 'Anonymous',
        message: '✅ Credentials are valid and account is accessible'
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error(`[${requestId}] ❌ Credential test failed:`, error)

    // Enhanced error messages
    let hint = 'Check your Hedera credentials and network configuration'
    let status = 500

    if (error.message?.includes('INVALID_SIGNATURE')) {
      hint = 'HEDERA_OPERATOR_KEY does not match HEDERA_OPERATOR_ID. Verify the private key belongs to this account.'
      status = 401
    } else if (error.message?.includes('INVALID_ACCOUNT_ID')) {
      hint = 'HEDERA_OPERATOR_ID format is invalid or account does not exist on this network.'
      status = 400
    } else if (error.message?.includes('network')) {
      hint = 'Network mismatch. Ensure HEDERA_NETWORK matches where your account exists (testnet/mainnet).'
      status = 502
    }

    return new Response(
      JSON.stringify({
        id: requestId,
        success: false,
        error: error.name || 'CredentialTestError',
        message: error.message,
        hint
      }),
      { status, headers: corsHeaders }
    )
  }
})
