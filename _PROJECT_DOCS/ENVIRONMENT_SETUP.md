# Environment Variables Setup

## Required Variables

### Frontend (Vite)

The following environment variables are required for the frontend application:

```bash
VITE_SUPABASE_URL=https://mrbfrwtymikayrbrzgmp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0
VITE_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
VITE_WALLETCONNECT_PROJECT_ID=ac9166dd615752bda362b92887c6a1ad
```

### Where They Are Used

1. **`VITE_SUPABASE_URL`** - Supabase project URL
   - Used in: `src/lib/supabaseClient.ts`
   - Purpose: Base URL for Supabase API calls

2. **`VITE_SUPABASE_ANON_KEY`** - Supabase anonymous/public key
   - Used in: `src/lib/supabaseClient.ts`
   - Purpose: Authentication for client-side API calls
   - Note: This is a public key, safe to expose in frontend code

3. **`VITE_MIRROR_NODE_URL`** - Hedera Mirror Node URL
   - Purpose: Query Hedera network data

4. **`VITE_WALLETCONNECT_PROJECT_ID`** - WalletConnect project ID
   - Purpose: Enable wallet connection features

## Setup Instructions

### Development

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. The default values in `.env.example` are already configured for the current Supabase project.

3. Start the development server:
   ```bash
   pnpm dev
   ```

### Production/Preview

Environment variables are automatically loaded from the build environment. The current values are hardcoded in `src/lib/supabaseClient.ts` as a fallback.

## Current Configuration

### Supabase Edge Functions

- **JWT Verification**: DISABLED (`verify_jwt = false` in `supabase/config.toml`)
- **Authentication Mode**: Anonymous access with `apikey` header only
- **No Authorization header required** for Edge Function calls

### API Client Configuration

The Supabase client is configured in `src/lib/supabaseClient.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Service Worker Configuration

The Service Worker (`public/sw.js`) is configured to **NOT intercept** Supabase API calls:

```javascript
if (url.hostname.endsWith('.supabase.co') || event.request.url.includes('/api/')) {
  return; // Let the browser handle these requests directly
}
```

## Testing

### Console Test

To verify the configuration, run this in the browser console:

```javascript
fetch('https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/register-batch', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json', 
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0'
  },
  body: JSON.stringify({
    batchId: 'TEST-UI',
    farmerId: 'test-farmer-001',
    productType: 'Test Product',
    quantity: 100,
    unit: 'kg',
    harvestDate: '2025-10-02',
    location: 'Test Location',
    certifications: [],
    qualityScore: 80,
    images: [],
    metadata: {}
  })
}).then(async r => ({ status: r.status, data: await r.json() })).then(console.log);
```

Expected result: `status: 200` with success response.

## Troubleshooting

### Service Worker Issues

If you see "from service worker" in Network tab:

1. Open DevTools > Application > Service Workers
2. Check "Bypass for network"
3. Click "Unregister" on the service worker
4. Hard reload (Ctrl+Shift+R or Cmd+Shift+R)

### 502 Bad Gateway

Check Supabase Edge Function logs:
- Dashboard: https://supabase.com/dashboard/project/mrbfrwtymikayrbrzgmp/functions/register-batch/logs
- Look for timeout, missing env vars, or runtime errors

### Date Format Issues

The app accepts dates in two formats:
- `DD-MM-YYYY` (e.g., "02-10-2025") - converted to ISO
- `YYYY-MM-DD` (e.g., "2025-10-02") - used as-is

Conversion is handled automatically in `src/lib/api.ts` via `normalizeDate()` function.
