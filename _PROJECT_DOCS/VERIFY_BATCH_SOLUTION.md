# ✅ Solution complète pour verify-batch 401

## Problème identifié
La fonction `verify-batch` retournait **401 "Missing authorization header"** car Supabase Edge Functions exigent **toujours** le header `apikey`, même avec `verify_jwt = false`.

## Correctifs appliqués

### 1. Configuration Supabase (`supabase/config.toml`)
```toml
[functions.verify-batch]
verify_jwt = false
```
✅ Permet l'accès public sans authentification utilisateur

### 2. Code frontend (`src/lib/api.ts`)
```typescript
export const verifyBatch = async (tokenId: string, serialNumber: string): Promise<VerifyBatchResponse> => {
  const { data, error } = await supabase.functions.invoke('verify-batch', {
    body: { tokenId, serialNumber },
    headers: {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  });
  // ...
}
```
✅ Ajoute le header `apikey` requis

### 3. Variables d'environnement
Assurez-vous que `.env` contient :
```env
VITE_SUPABASE_URL=https://mrbfrwtymikayrbrzgmp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Déploiement

### Redéployer la fonction avec la nouvelle config
```bash
supabase functions deploy verify-batch
```

### Vérifier le déploiement
```bash
supabase functions list
```

## Tests

### Test avec curl (utilisez `test-verify-with-apikey.sh`)
```bash
#!/bin/bash
PROJECT_REF="mrbfrwtymikayrbrzgmp"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/verify-batch"

curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "tokenId": "0.0.5184926",
    "serialNumber": "1"
  }'
```

### Résultats attendus
- ✅ **200 OK** : NFT trouvé et vérifié
- ✅ **404 Not Found** : NFT non enregistré (comportement normal)
- ✅ **400 Bad Request** : Données manquantes
- ❌ **401 Unauthorized** : Header apikey manquant (corrigé)

## Comprendre verify_jwt

| Configuration | Headers requis | Cas d'usage |
|--------------|----------------|-------------|
| `verify_jwt = false` | `apikey` uniquement | Accès public (verify-batch) |
| `verify_jwt = true` | `apikey` + `Authorization: Bearer <token>` | Accès authentifié (dashboard) |

## Checklist de déploiement

- [x] Ajouter `[functions.verify-batch]` avec `verify_jwt = false` dans `config.toml`
- [x] Ajouter header `apikey` dans `verifyBatch()` frontend
- [ ] Redéployer la fonction : `supabase functions deploy verify-batch`
- [ ] Tester avec curl ou depuis l'interface web
- [ ] Vérifier les logs : `supabase functions logs verify-batch --follow`

## Logs de diagnostic

Pour voir les logs en temps réel :
```bash
supabase functions logs verify-batch --follow
```

Vous devriez voir :
```
=== VERIFY-BATCH REQUEST RECEIVED ===
Method: POST
Stage: Parsing request body
Body received: {"tokenId":"0.0.5184926","serialNumber":"1"}
Verifying NFT: 0.0.5184926 #1
```

## Prochaines étapes

1. **Redéployer** la fonction avec la config mise à jour
2. **Tester** depuis l'interface web à `/verify/0.0.7160982/1`
3. **Vérifier** que le 401 est résolu et que la vérification fonctionne

---

**Note** : Le frontend utilise maintenant `import.meta.env.VITE_SUPABASE_ANON_KEY` pour inclure automatiquement l'apikey dans tous les appels à `verify-batch`.
