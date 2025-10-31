# Solution: 401 Missing Authorization Header

## Problème Identifié

Le test montre que :
- ✅ **Avec Authorization header** : Fonctionne (200 OK)
- ❌ **Sans Authorization header** : Échoue (401)

Cela signifie que **`verify_jwt` est toujours activé** sur Supabase (malgré `config.toml`).

## Solution Appliquée

### 1. Frontend mis à jour (`src/lib/api.ts`)

Le code frontend envoie maintenant automatiquement le header `Authorization` :

```typescript
// Get current session to include Authorization header
const { data: { session } } = await supabase.auth.getSession();

const headers: Record<string, string> = {};

// If user is logged in, include Authorization header
if (session?.access_token) {
  headers['Authorization'] = `Bearer ${session.access_token}`;
}

const { data: result, error } = await supabase.functions.invoke('register-batch', {
  body: normalizedData,
  headers
});
```

**Comportement** :
- Si utilisateur connecté → Envoie `Authorization: Bearer <user_token>`
- Si utilisateur non connecté → Envoie seulement `apikey` (nécessite `verify_jwt = false`)

### 2. Options pour l'accès anonyme

Si vous voulez permettre l'accès **sans connexion utilisateur**, vous devez :

#### Option A: Désactiver JWT dans Supabase Dashboard (Recommandé)

1. Aller sur **Supabase Dashboard**
2. **Edge Functions** → `register-batch` → **Settings**
3. Désactiver **"Verify JWT with legacy secret"**
4. Cliquer **Save**

#### Option B: Redéployer avec --no-verify-jwt

```bash
supabase functions deploy register-batch --no-verify-jwt
supabase functions deploy test-hedera-credentials --no-verify-jwt
```

**Note** : Le fichier `supabase/config.toml` avec `verify_jwt = false` n'est appliqué que lors du déploiement.

## Test de Vérification

### Test 1: Avec utilisateur connecté (fonctionne maintenant)

```bash
# Le frontend envoie automatiquement Authorization header si user connecté
# Testez depuis l'UI après connexion
```

### Test 2: Sans utilisateur (nécessite Option A ou B ci-dessus)

```bash
./quick-test.sh no-jwt
```

Devrait retourner 200 OK après avoir désactivé JWT.

## Résumé

| Scénario | Authorization Header | Résultat |
|----------|---------------------|----------|
| User connecté (frontend) | ✅ Envoyé automatiquement | ✅ Fonctionne |
| User non connecté (frontend) | ❌ Non envoyé | ❌ 401 (sauf si JWT désactivé) |
| Test curl avec header | ✅ Envoyé manuellement | ✅ Fonctionne |
| Test curl sans header | ❌ Non envoyé | ❌ 401 (sauf si JWT désactivé) |

## Prochaines Étapes

1. **Testez l'UI** : Connectez-vous et essayez d'enregistrer un batch
2. **Si vous voulez l'accès anonyme** : Appliquez Option A ou B ci-dessus
3. **Vérifiez les logs** : `supabase functions logs register-batch --limit 20`
