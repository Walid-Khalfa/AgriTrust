# 🔍 Diagnostic 404 verify-batch - Supabase Edge Functions

## 📊 Diagnostic des causes probables

### ✅ Causes identifiées et éliminées

1. **Code existant** ✅
   - Le fichier `supabase/functions/verify-batch/index.ts` existe
   - Le code utilise correctement `serve()` de Deno
   - Les CORS headers sont présents

2. **Nom de fonction** ✅
   - Dossier: `verify-batch` (avec tiret, pas underscore)
   - URL attendue: `/functions/v1/verify-batch` ✅

3. **Méthode HTTP** ✅
   - OPTIONS géré (preflight CORS)
   - POST géré dans le try/catch

### ⚠️ Cause probable #1: **FONCTION NON DÉPLOYÉE**

**Symptôme**: 404 = le routeur Supabase ne trouve pas la route
- `tokenize-batch` retourne 500 (route existe, erreur interne)
- `verify-batch` retourne 404 (route n'existe pas)

**Diagnostic**:
```bash
# Si la fonction n'apparaît pas dans les logs après appel → NON DÉPLOYÉE
supabase functions list --project-ref mrbfrwtymikayrbrzgmp
```

**Solution**: Déployer la fonction (voir section Déploiement)

---

## 🚀 Déploiement et vérification

### 1. Déployer verify-batch

```bash
# Depuis la racine du projet
supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp

# Ou via le Dashboard Supabase:
# 1. Aller dans Edge Functions
# 2. Sélectionner verify-batch
# 3. Cliquer "Deploy" ou "Publish"
```

### 2. Vérifier le déploiement

```bash
# Lister les fonctions déployées
supabase functions list --project-ref mrbfrwtymikayrbrzgmp

# Devrait afficher:
# - verify-batch (avec version/timestamp)
# - tokenize-batch
# - dashboard-stats
# - etc.
```

### 3. Consulter les logs en temps réel

```bash
# Terminal - logs en direct
supabase functions logs verify-batch --project-ref mrbfrwtymikayrbrzgmp --follow

# Ou dans le Dashboard:
# Edge Functions → verify-batch → Logs
```

### 4. Différencier erreur routeur vs fonction

| Symptôme | Cause | Logs visibles? |
|----------|-------|----------------|
| **404** | Route n'existe pas (non déployée) | ❌ Aucun log |
| **401/400/500** | Route existe, erreur dans la fonction | ✅ Logs présents |

**Test**: Après déploiement, si vous voyez `=== VERIFY-BATCH REQUEST RECEIVED ===` dans les logs → route OK

---

## 🧪 Tests reproductibles

### Test 1: OPTIONS (preflight CORS)

```bash
curl -i -X OPTIONS 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch'

# Attendu:
# HTTP/2 200 (ou 204)
# access-control-allow-origin: *
# access-control-allow-headers: authorization, x-client-info, apikey, content-type
```

**Logs attendus**:
```
OPTIONS preflight - returning CORS headers
```

---

### Test 2: POST sans Authorization (doit retourner 400, pas 404)

```bash
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -d '{"tokenId":"0.0.7160982","serialNumber":"1"}'

# Attendu (si fonction déployée):
# HTTP/2 200 ou 400 ou 404 (NFT not found)
# PAS 404 (route not found)
```

**Logs attendus**:
```
=== VERIFY-BATCH REQUEST RECEIVED ===
Method: POST
Stage: Parsing request body
Body received: {"tokenId":"0.0.7160982","serialNumber":"1"}
Stage: Creating Supabase client
Stage: Querying batches table for 0.0.7160982 #1
```

---

### Test 3: POST avec Authorization (Bearer anon key)

```bash
curl -i -X POST 'https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0' \
  -d '{"tokenId":"0.0.7160982","serialNumber":"1"}'

# Attendu:
# HTTP/2 200 (si NFT existe)
# HTTP/2 404 (si NFT n'existe pas en DB)
# Body JSON avec { success: true, ... } ou { error: "NFT not found", ... }
```

---

### Test 4: SDK TypeScript

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://mrbfrwtymikayrbrzgmp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yYmZyd3R5bWlrYXlyYnJ6Z21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzNTkxMzEsImV4cCI6MjA3NjkzNTEzMX0.jB41gP89pz1hZ_M3cXJxVjnYqFNbOHxTUEmIXS7PhI0'
)

const { data, error } = await supabase.functions.invoke('verify-batch', {
  body: { tokenId: '0.0.7160982', serialNumber: '1' }
})

console.log('verify-batch result:', { data, error })

// Attendu si déployé:
// data: { success: true, tokenId: '0.0.7160982', ... }
// error: null

// Attendu si NON déployé:
// data: null
// error: { message: 'FunctionsHttpError: ...' }
```

---

## ✅ Matrice d'acceptation

| Test | Statut attendu | Body attendu | Logs attendus |
|------|----------------|--------------|---------------|
| OPTIONS | 200/204 | `ok` | `OPTIONS preflight` |
| POST sans payload | 400 | `{ stage: 'validation', error: '...' }` | `Validation failed` |
| POST payload valide (NFT existe) | 200 | `{ success: true, ... }` | `Stage: Success` |
| POST payload valide (NFT n'existe pas) | 404 | `{ stage: 'database_query', error: 'NFT not found' }` | `Batch query failed` |
| POST avec erreur interne | 500 | `{ stage: 'exception', error: '...' }` | `VERIFY-BATCH ERROR` |

**CRITIQUE**: Si vous obtenez 404 sur POST → fonction NON DÉPLOYÉE (aucun log visible)

---

## 📋 Checklist 60 secondes

Si le 404 persiste après déploiement:

- [ ] **Nom du dossier** = `verify-batch` (pas `verify_batch`)
- [ ] **Fichier** = `supabase/functions/verify-batch/index.ts` existe
- [ ] **Déployé** = `supabase functions list` affiche `verify-batch`
- [ ] **Project ref** = `mrbfrwtymikayrbrzgmp` (correct dans l'URL)
- [ ] **URL** = `https://mrbfrwtymikayrbrzgmp.supabase.co/functions/v1/verify-batch` (pas de slash final)
- [ ] **Région** = vérifier que le projet est dans la bonne région
- [ ] **Cache navigateur** = vider le cache ou tester en incognito
- [ ] **SDK vs fetch** = tester avec `supabase.functions.invoke()` (pas `fetch` direct)
- [ ] **Logs** = après appel POST, vérifier si logs apparaissent (si non → pas déployé)

---

## 🔧 Bonus: Analyse du 500 tokenize-batch

### Erreur observée

```
METADATA_TOO_LONG
receipt for transaction 0.0.7127337@1761827270.473391066 contained error status METADATA_TOO_LONG
```

### Cause

La fonction `tokenize-batch` essaie de créer/minter un NFT Hedera avec des métadonnées trop longues.

**Limite Hedera**: 100 bytes pour les métadonnées NFT

### Localisation du problème

Fichier: `supabase/functions/tokenize-batch/index.ts`

Chercher:
```typescript
TokenMintTransaction()
  .setMetadata([...]) // ← Métadonnées trop longues
```

### Solution rapide

1. **Réduire les métadonnées**:
   - Utiliser un hash IPFS au lieu du contenu complet
   - Stocker les données complètes dans Supabase
   - Mettre seulement l'ID/hash dans les métadonnées NFT

2. **Vérifier la taille**:
```typescript
const metadata = Buffer.from(JSON.stringify(data));
if (metadata.length > 100) {
  console.error('Metadata too long:', metadata.length);
  // Utiliser un hash à la place
  const metadataHash = hashFunction(data);
  // Stocker data en DB, mettre hash dans NFT
}
```

3. **Logs à ajouter**:
```typescript
console.log('Metadata size:', metadata.length, 'bytes');
console.log('Metadata content:', metadata.toString());
```

### Déployer le correctif

```bash
supabase functions deploy tokenize-batch --project-ref mrbfrwtymikayrbrzgmp
```

---

## 📞 Support

Si le problème persiste:

1. **Vérifier les logs Dashboard**: Edge Functions → verify-batch → Logs
2. **Tester avec curl**: Copier-coller les commandes ci-dessus
3. **Vérifier le déploiement**: `supabase functions list`
4. **Partager les logs**: Copier les logs complets pour diagnostic

---

## 🎯 Résumé

**Problème**: 404 sur `verify-batch`
**Cause probable**: Fonction non déployée sur Supabase
**Solution**: `supabase functions deploy verify-batch --project-ref mrbfrwtymikayrbrzgmp`
**Vérification**: Logs doivent afficher `=== VERIFY-BATCH REQUEST RECEIVED ===`
