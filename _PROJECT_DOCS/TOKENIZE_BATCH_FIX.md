# 🔧 Fix tokenize-batch METADATA_TOO_LONG Error

## 🐛 Erreur observée

```
StatusError: receipt for transaction 0.0.7127337@1761827270.473391066 contained error status METADATA_TOO_LONG
```

## 📊 Analyse

### Cause racine

**Hedera NFT metadata limit**: 100 bytes maximum par NFT

**Code actuel** (lignes 126-136):
```typescript
const metadataString = JSON.stringify({
  hcs: hcsTransactionIds,  // ← Tableau de transaction IDs (très long!)
  bid: batchId,
  ts: new Date().toISOString(),
});
const metadata = new TextEncoder().encode(metadataString);
// metadata peut facilement dépasser 100 bytes
```

### Exemple de taille

```typescript
// Transaction ID Hedera format:
"0x6afc35a6cdf71a59189fd3469ddc5b72a2f00fa00f6cced430d785e1c126e1e613a221d64ab9d4fe636a153407499f5a"
// = 98 caractères par transaction ID!

// Avec 2 transactions:
{
  "hcs": [
    "0x6afc35a6cdf71a59189fd3469ddc5b72a2f00fa00f6cced430d785e1c126e1e613a221d64ab9d4fe636a153407499f5a",
    "0x..."
  ],
  "bid": "uuid",
  "ts": "2025-10-30T12:28:01.463Z"
}
// Total: ~250+ bytes → DÉPASSE LA LIMITE
```

## ✅ Solution: Utiliser un hash compact

### Option 1: Hash SHA-256 (recommandé)

```typescript
// Ajouter en haut du fichier
import { createHash } from "node:crypto";

// Remplacer lignes 126-136 par:
const fullMetadata = {
  hcs: hcsTransactionIds,
  bid: batchId,
  ts: new Date().toISOString(),
};

// Créer un hash compact (32 bytes en hex = 64 caractères)
const metadataHash = createHash('sha256')
  .update(JSON.stringify(fullMetadata))
  .digest('hex');

// Stocker les données complètes en DB (voir ci-dessous)
// Utiliser seulement le hash dans le NFT
const metadata = new TextEncoder().encode(metadataHash);

console.log("[tokenize-batch] Metadata hash:", metadataHash);
console.log("[tokenize-batch] Metadata size:", metadata.length, "bytes");

if (metadata.length > 100) {
  throw new Error(`Metadata too long: ${metadata.length} bytes (max 100)`);
}
```

### Option 2: Référence IPFS (si disponible)

```typescript
// Si vous utilisez IPFS pour stocker les métadonnées complètes
const ipfsHash = "QmXxx..."; // Hash IPFS des métadonnées complètes
const metadata = new TextEncoder().encode(ipfsHash);
```

### Option 3: ID court + stockage DB

```typescript
// Créer un ID court unique
const shortId = crypto.randomUUID().substring(0, 8); // 8 caractères
const metadata = new TextEncoder().encode(shortId);

// Stocker les métadonnées complètes dans une nouvelle table
await supabase
  .from("nft_metadata")
  .insert({
    short_id: shortId,
    token_id: tokenId.toString(),
    hcs_transaction_ids: hcsTransactionIds,
    batch_id: batchId,
    created_at: new Date().toISOString(),
  });
```

## 🚀 Implémentation recommandée (Option 1 + DB)

### 1. Créer une migration pour stocker les métadonnées complètes

```sql
-- supabase/migrations/20251030_create_nft_metadata.sql
CREATE TABLE IF NOT EXISTS nft_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id TEXT NOT NULL,
  serial_number TEXT,
  metadata_hash TEXT NOT NULL UNIQUE,
  full_metadata JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_nft_metadata_token_id ON nft_metadata(token_id);
CREATE INDEX idx_nft_metadata_hash ON nft_metadata(metadata_hash);
```

### 2. Modifier tokenize-batch/index.ts

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { createHash } from "node:crypto"; // ← AJOUTER
import {
  Client,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenId,
  AccountId,
} from "npm:@hashgraph/sdk@2.49.2";

// ... (garder le code existant jusqu'à la ligne 125)

// REMPLACER lignes 126-141 par:
const fullMetadata = {
  hcs: hcsTransactionIds,
  bid: batchId,
  ts: new Date().toISOString(),
  batch: batchData ? {
    product_type: batchData.product_type,
    batch_number: batchData.batch_number,
  } : null,
};

// Créer un hash compact pour le NFT
const metadataHash = createHash('sha256')
  .update(JSON.stringify(fullMetadata))
  .digest('hex');

const metadata = new TextEncoder().encode(metadataHash);

console.log("[tokenize-batch] Full metadata:", JSON.stringify(fullMetadata));
console.log("[tokenize-batch] Metadata hash:", metadataHash);
console.log("[tokenize-batch] Metadata size:", metadata.length, "bytes");

// Vérification de sécurité
if (metadata.length > 100) {
  throw new Error(`Metadata too long: ${metadata.length} bytes (max 100)`);
}

console.log("[tokenize-batch] Creating mint transaction...");
const mintTx = await new TokenMintTransaction()
  .setTokenId(tokenId)
  .setMetadata([metadata])
  .freezeWith(client);

console.log("[tokenize-batch] Executing mint transaction...");
const mintSubmit = await mintTx.execute(client);
const mintReceipt = await mintSubmit.getReceipt(client);

const serialNumbers = mintReceipt.serials;

// Stocker les métadonnées complètes en DB
console.log("[tokenize-batch] Storing full metadata in database...");
await supabase
  .from("nft_metadata")
  .insert({
    token_id: tokenId.toString(),
    serial_number: serialNumbers[0]?.toString(),
    metadata_hash: metadataHash,
    full_metadata: fullMetadata,
  });

// Update batch with token info if batchId provided
if (batchId) {
  await supabase
    .from("batches")
    .update({
      hedera_token_id: tokenId.toString(),
      hedera_serial_number: serialNumbers[0]?.toString(),
      tokenized_at: new Date().toISOString(),
    })
    .eq("id", batchId);
}

// ... (garder le reste du code)
```

### 3. Modifier verify-batch pour récupérer les métadonnées complètes

```typescript
// Dans verify-batch/index.ts, après avoir trouvé le batch:

// Récupérer les métadonnées complètes depuis nft_metadata
const { data: nftMetadata, error: metadataError } = await supabaseClient
  .from('nft_metadata')
  .select('*')
  .eq('token_id', tokenId)
  .eq('serial_number', serialNumber)
  .single();

if (metadataError) {
  console.warn('NFT metadata not found in nft_metadata table:', metadataError);
}

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
  // Métadonnées complètes depuis nft_metadata table
  fullMetadata: nftMetadata?.full_metadata || null,
  metadataHash: nftMetadata?.metadata_hash || null,
  hcsTransactionIds: hcsTransactionIds,
  hcsMessages: hcsMessages || [],
  ai_summary: batch.ai_provenance_summary || null,
};
```

## 📋 Checklist de déploiement

- [ ] Créer la migration `nft_metadata` table
- [ ] Appliquer la migration: `supabase db push`
- [ ] Modifier `tokenize-batch/index.ts` avec le hash
- [ ] Modifier `verify-batch/index.ts` pour lire `nft_metadata`
- [ ] Déployer les fonctions:
  ```bash
  supabase functions deploy tokenize-batch --project-ref mrbfrwtymikayrbrzgmp
  supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp
  ```
- [ ] Tester avec un nouveau batch
- [ ] Vérifier les logs: pas d'erreur `METADATA_TOO_LONG`

## 🧪 Test après correctif

```bash
# Tester tokenize-batch avec le nouveau code
curl -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/tokenize-batch' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT' \
  -d '{
    "hcsTransactionIds": [
      "0x6afc35a6cdf71a59189fd3469ddc5b72a2f00fa00f6cced430d785e1c126e1e613a221d64ab9d4fe636a153407499f5a"
    ],
    "batchId": "uuid-here"
  }'

# Attendu:
# HTTP/2 200
# { "success": true, "tokenId": "0.0.xxx", "serialNumber": "1", ... }
```

## 📊 Comparaison des tailles

| Approche | Taille | Limite Hedera | Status |
|----------|--------|---------------|--------|
| JSON complet (actuel) | ~250+ bytes | 100 bytes | ❌ ÉCHOUE |
| SHA-256 hash | 64 bytes | 100 bytes | ✅ OK |
| UUID court (8 chars) | 8 bytes | 100 bytes | ✅ OK |
| IPFS hash | ~46 bytes | 100 bytes | ✅ OK |

## 🎯 Résumé

**Problème**: `METADATA_TOO_LONG` car les transaction IDs Hedera sont trop longs
**Solution**: Stocker un hash SHA-256 (64 bytes) dans le NFT, métadonnées complètes en DB
**Avantages**:
- ✅ Respecte la limite Hedera (100 bytes)
- ✅ Métadonnées complètes accessibles via DB
- ✅ Hash vérifiable (intégrité des données)
- ✅ Pas de perte d'information

**Déploiement**: Migration DB + modification des 2 Edge Functions + redéploiement
