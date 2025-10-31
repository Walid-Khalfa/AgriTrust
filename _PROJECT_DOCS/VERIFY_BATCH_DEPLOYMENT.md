# Déploiement verify-batch - Guide Complet

## 📋 Résumé

Edge Function **verify-batch** configurée pour :
- ✅ Utilise `SUPABASE_SERVICE_ROLE_KEY` côté serveur (bypass RLS)
- ✅ Utilise `.maybeSingle()` pour éviter erreurs "Cannot coerce"
- ✅ Retourne 404 JSON propre si NFT non trouvé
- ✅ CORS complet (OPTIONS + headers)
- ✅ Logs détaillés sans exposer secrets

---

## 🔐 1. Configuration des Secrets

```bash
# Définir la SERVICE_ROLE_KEY (JAMAIS côté client !)
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzU1NzI0NiwiZXhwIjoyMDUzMTMzMjQ2fQ.Vj9Ql3Ql-Ql3Ql3Ql3Ql3Ql3Ql3Ql3Ql3Ql3Ql3Ql3Ql

# Vérifier les secrets
supabase secrets list
```

---

## 🚀 2. Déploiement

```bash
# Déployer la fonction
supabase functions deploy verify-batch

# Vérifier le déploiement
supabase functions list
```

---

## ⚙️ 3. Configuration verify_jwt

**Fichier : `supabase/config.toml`**

```toml
[functions.verify-batch]
verify_jwt = false  # ← Public access (recommandé pour vérification NFT)
```

### Impact de `verify_jwt` :

| Paramètre | Headers requis | Cas d'usage |
|-----------|---------------|-------------|
| `verify_jwt = false` | `apikey` uniquement | ✅ **Vérification publique NFT** (recommandé) |
| `verify_jwt = true` | `apikey` + `Authorization: Bearer <user_token>` | Accès réservé utilisateurs connectés |

⚠️ **IMPORTANT** : Le header `apikey` est **TOUJOURS obligatoire**, même avec `verify_jwt=false`.

---

## 🧪 4. Tests

### A. Test OPTIONS (CORS Preflight)

```bash
curl -X OPTIONS \
  https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcyNDYsImV4cCI6MjA1MzEzMzI0Nn0.YOUR_ANON_KEY" \
  -v
```

**Attendu** : `200 OK` avec headers CORS

---

### B. Test POST - NFT Valide (avec apikey)

```bash
curl -X POST \
  https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcyNDYsImV4cCI6MjA1MzEzMzI0Nn0.YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.5187330",
    "serialNumber": "1"
  }'
```

**Attendu** : `200 OK` avec données batch ou `404` si non trouvé

---

### C. Test POST - Payload Invalide

```bash
curl -X POST \
  https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcyNDYsImV4cCI6MjA1MzEzMzI0Nn0.YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Attendu** : `400 Bad Request`
```json
{
  "stage": "validation",
  "error": "tokenId and serialNumber are required",
  "received": {}
}
```

---

### D. Test POST - Sans apikey (erreur)

```bash
curl -X POST \
  https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch \
  -H "Content-Type: application/json" \
  -d '{
    "tokenId": "0.0.5187330",
    "serialNumber": "1"
  }'
```

**Attendu** : `401 Unauthorized`
```json
{
  "msg": "Missing authorization header"
}
```

---

## 📱 5. Test SDK TypeScript

**Fichier : `test-verify-sdk.ts`**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mrbfrwtymikayrbrzgmp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1NTcyNDYsImV4cCI6MjA1MzEzMzI0Nn0.YOUR_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testVerifyBatch() {
  console.log('Testing verify-batch...');
  
  const { data, error } = await supabase.functions.invoke('verify-batch', {
    body: {
      tokenId: '0.0.5187330',
      serialNumber: '1'
    }
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success:', data);
  }
}

testVerifyBatch();
```

**Exécution** :
```bash
deno run --allow-net test-verify-sdk.ts
```

---

## 🗄️ 6. Insérer un Batch de Test

```sql
-- Insérer dans Supabase SQL Editor
INSERT INTO batches (
  batch_number,
  product_type,
  quantity,
  harvest_date,
  location,
  certifications,
  hedera_token_id,
  hedera_serial_number,
  hcs_transaction_ids,
  tokenized_at
) VALUES (
  'BATCH-TEST-001',
  'Organic Tomatoes',
  500,
  '2024-01-15',
  'Farm A, Region X',
  ARRAY['Organic', 'Fair Trade'],
  '0.0.5187330',
  1,
  ARRAY['0.0.123@1234567890.123456789'],
  NOW()
);
```

---

## 🔍 7. Vérifier les Logs

```bash
# Logs en temps réel
supabase functions logs verify-batch --tail

# Logs récents
supabase functions logs verify-batch
```

**Logs attendus** :
```
=== VERIFY-BATCH REQUEST ===
Method: POST
Headers: { ... apikey: '***' }
Body: { tokenId: '0.0.5187330', serialNumber: '1' }
→ Supabase client created (service role)
→ Querying batches: 0.0.5187330 #1
→ Batch found: abc123...
→ Success (200)
```

---

## ⚠️ 8. Résolution Problèmes

### Erreur 401 "Missing authorization header"

**Cause** : Header `apikey` manquant

**Solution** :
```bash
# cURL : Ajouter -H "apikey: YOUR_ANON_KEY"
# SDK : Le client Supabase ajoute automatiquement apikey
```

---

### Erreur 404 "NFT not found"

**Cause** : Aucun batch avec ce `tokenId` + `serialNumber`

**Solution** :
1. Vérifier les données : `SELECT * FROM batches WHERE hedera_token_id = '0.0.5187330';`
2. Insérer un batch de test (voir section 6)

---

### Erreur "Cannot coerce the result to a single JSON object"

**Cause** : Utilisation de `.single()` au lieu de `.maybeSingle()`

**Solution** : ✅ Déjà corrigé dans le code actuel (ligne 87)

---

## 🎯 9. Checklist Déploiement

- [ ] Secrets configurés (`SUPABASE_SERVICE_ROLE_KEY`)
- [ ] `verify_jwt = false` dans `config.toml`
- [ ] Fonction déployée (`supabase functions deploy verify-batch`)
- [ ] Test OPTIONS réussi (CORS)
- [ ] Test POST avec apikey réussi
- [ ] Batch de test inséré en DB
- [ ] Logs vérifiés (pas d'erreurs)
- [ ] Frontend mis à jour (SDK avec apikey automatique)

---

## 📚 10. Notes Sécurité

| ⚠️ NE JAMAIS | ✅ TOUJOURS |
|-------------|------------|
| Exposer `SERVICE_ROLE_KEY` côté client | Utiliser `SERVICE_ROLE_KEY` uniquement dans Edge Functions |
| Hardcoder les secrets dans le code | Utiliser `Deno.env.get()` pour les secrets |
| Commit `.env` dans Git | Ajouter `.env` au `.gitignore` |
| Utiliser `verify_jwt=false` pour données sensibles | Utiliser `verify_jwt=true` pour opérations utilisateur |

---

## ✅ Résultat Final

Fonction **verify-batch** :
- ✅ Bypass RLS avec service role key
- ✅ Gestion propre des cas "no row" (404 JSON)
- ✅ CORS complet
- ✅ Logs détaillés sans fuites
- ✅ Prête pour production

**Prochaine étape** : Déployer et tester avec les commandes ci-dessus.
