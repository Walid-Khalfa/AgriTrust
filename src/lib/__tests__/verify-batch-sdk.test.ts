/**
 * Test SDK pour verify-batch Edge Function
 * 
 * Usage:
 * pnpm test src/lib/__tests__/verify-batch-sdk.test.ts
 */

import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0';

describe('verify-batch Edge Function - SDK Tests', () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  it('should return error for missing tokenId', async () => {
    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { serialNumber: '1' }
    });

    // Si 404 → fonction non déployée
    if (error && error.message.includes('404')) {
      console.error('❌ FONCTION NON DÉPLOYÉE - 404 détecté');
      console.error('Solution: supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp');
      throw new Error('verify-batch function not deployed (404)');
    }

    expect(error).toBeNull();
    expect(data).toHaveProperty('stage', 'validation');
    expect(data).toHaveProperty('error');
  });

  it('should return error for missing serialNumber', async () => {
    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { tokenId: '0.0.7160982' }
    });

    if (error && error.message.includes('404')) {
      throw new Error('verify-batch function not deployed (404)');
    }

    expect(error).toBeNull();
    expect(data).toHaveProperty('stage', 'validation');
    expect(data).toHaveProperty('error');
  });

  it('should verify NFT with valid tokenId and serialNumber', async () => {
    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { 
        tokenId: '0.0.7160982', 
        serialNumber: '1' 
      }
    });

    if (error && error.message.includes('404')) {
      throw new Error('verify-batch function not deployed (404)');
    }

    expect(error).toBeNull();
    
    // Peut retourner success: true (NFT trouvé) ou error: 'NFT not found' (NFT pas en DB)
    if (data.success) {
      expect(data).toHaveProperty('tokenId', '0.0.7160982');
      expect(data).toHaveProperty('serialNumber');
      expect(data).toHaveProperty('status', 'VERIFIED');
      expect(data).toHaveProperty('nftMetadata');
    } else {
      expect(data).toHaveProperty('stage', 'database_query');
      expect(data).toHaveProperty('error', 'NFT not found or not registered in our system');
    }
  });

  it('should handle non-existent NFT gracefully', async () => {
    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { 
        tokenId: '0.0.9999999', 
        serialNumber: '999' 
      }
    });

    if (error && error.message.includes('404')) {
      throw new Error('verify-batch function not deployed (404)');
    }

    expect(error).toBeNull();
    expect(data).toHaveProperty('stage', 'database_query');
    expect(data).toHaveProperty('verified', false);
    expect(data).toHaveProperty('error');
  });

  it('should include diagnostic stage information in responses', async () => {
    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { 
        tokenId: '0.0.7160982', 
        serialNumber: '1' 
      }
    });

    if (error && error.message.includes('404')) {
      throw new Error('verify-batch function not deployed (404)');
    }

    expect(error).toBeNull();
    
    // Toutes les réponses doivent avoir un champ 'stage' pour le diagnostic
    expect(data).toHaveProperty('stage');
    
    console.log('Response stage:', data.stage);
    console.log('Full response:', JSON.stringify(data, null, 2));
  });
});

/**
 * Instructions de déploiement si tests échouent avec 404:
 * 
 * 1. Déployer la fonction:
 *    supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp
 * 
 * 2. Vérifier le déploiement:
 *    supabase functions list --project-ref mrbfrwtymikayrbrzgmp
 * 
 * 3. Consulter les logs:
 *    supabase functions logs verify-batch --project-ref mrbfrwtymikayrbrzgmp --follow
 * 
 * 4. Relancer les tests:
 *    pnpm test src/lib/__tests__/verify-batch-sdk.test.ts
 */
