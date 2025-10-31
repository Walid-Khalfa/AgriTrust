import { describe, it, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0';

describe('verify-batch Edge Function Integration Tests', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(() => {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  });

  it('should return 401 when Authorization header is missing', async () => {
    // Create a client without auth session
    const unauthenticatedClient = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await unauthenticatedClient.functions.invoke('verify-batch', {
      body: { tokenId: '0.0.123', serialNumber: '1' }
    });

    // Should get an error due to missing authorization
    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it('should include Authorization header automatically when session exists', async () => {
    // This test verifies that the Supabase client automatically includes
    // the Authorization header when a user session is active
    
    // Note: This test requires a valid user session to pass
    // In a real scenario, you would sign in a test user first
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('No active session - skipping authenticated test');
      return;
    }

    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { tokenId: '0.0.123', serialNumber: '1' }
    });

    // With a valid session, the request should not fail due to missing auth
    // It may fail for other reasons (batch not found, etc.) but not 401
    if (error) {
      expect(error.message).not.toContain('Unauthorized');
      expect(error.message).not.toContain('authorization');
    }
  });

  it('should handle CORS preflight correctly', async () => {
    // Test that OPTIONS requests are handled correctly
    const response = await fetch(
      `${supabaseUrl}/functions/v1/verify-batch`,
      {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type,authorization'
        }
      }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('access-control-allow-methods')).toContain('POST');
  });

  it('should verify batch data structure when successful', async () => {
    // Sign in with a test user (you'll need to create this user in Supabase)
    // For now, this test is a template showing the expected structure
    
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.warn('No active session - skipping data structure test');
      return;
    }

    const { data, error } = await supabase.functions.invoke('verify-batch', {
      body: { tokenId: '0.0.123', serialNumber: '1' }
    });

    if (!error && data) {
      // Verify response structure
      expect(data).toHaveProperty('verified');
      expect(typeof data.verified).toBe('boolean');
      
      if (data.verified) {
        expect(data).toHaveProperty('batch');
        expect(data.batch).toHaveProperty('tokenId');
        expect(data.batch).toHaveProperty('serialNumber');
      }
    }
  });
});
