# Tests pour verify-batch Edge Function

## Vue d'ensemble

Des tests ont été créés pour détecter et corriger le bug de l'Authorization header manquant lors des appels à la fonction Edge `verify-batch`.

## Structure des tests

### 1. Tests unitaires (`src/lib/__tests__/api.test.ts`)

Tests unitaires pour la fonction `verifyBatch` avec mocks:

- ✅ Vérification des paramètres passés à `supabase.functions.invoke`
- ✅ Gestion de l'Authorization header automatique par le client Supabase
- ✅ Gestion des erreurs 401 Unauthorized
- ✅ Gestion des erreurs réseau
- ✅ Parsing des réponses d'erreur structurées de l'Edge Function

### 2. Tests d'intégration (`src/lib/__tests__/integration/verify-batch.integration.test.ts`)

Tests d'intégration avec le vrai endpoint Supabase:

- ✅ Vérification du retour 401 sans Authorization header
- ✅ Vérification de l'inclusion automatique de l'Authorization header avec session active
- ✅ Test CORS preflight (OPTIONS)
- ✅ Validation de la structure des données de réponse

## Exécution des tests

```bash
# Exécuter tous les tests
pnpm test

# Exécuter les tests avec interface UI
pnpm test:ui

# Exécuter les tests avec couverture de code
pnpm test:coverage
```

## Résultats attendus

### Tests unitaires
- Tous les tests doivent passer
- Confirment que le code appelle correctement `supabase.functions.invoke`
- Vérifient la gestion d'erreur appropriée

### Tests d'intégration
- **Sans session**: Erreur 401 attendue (normal)
- **Avec session**: Pas d'erreur 401 liée à l'authorization
- **CORS**: Headers corrects sur OPTIONS request

## Correction du bug

Le bug principal est que le client Supabase doit avoir une session active pour envoyer automatiquement l'Authorization header.

### Solution recommandée:

1. **Vérifier l'état de connexion avant d'appeler verify-batch**:

```typescript
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Vous devez être connecté pour vérifier un batch');
}

// Maintenant l'appel inclura automatiquement l'Authorization header
const result = await verifyBatch(tokenId, serialNumber);
```

2. **Ou modifier la fonction Edge pour accepter les requêtes anonymes** (si approprié):

Dans `supabase/functions/verify-batch/index.ts`, utiliser la clé anon au lieu de forwarder l'Authorization header:

```typescript
// Au lieu de:
const authHeader = req.headers.get('Authorization');
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  { global: { headers: { Authorization: authHeader! } } }
);

// Utiliser:
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);
```

## Prochaines étapes

1. ✅ Tests créés
2. ⏳ Décider de la stratégie: requêtes authentifiées ou anonymes
3. ⏳ Implémenter la correction dans le code frontend ou backend
4. ⏳ Vérifier que tous les tests passent
5. ⏳ Tester manuellement dans le navigateur

## Notes importantes

- Le client Supabase JS inclut **automatiquement** l'Authorization header quand une session existe
- Pas besoin de passer manuellement le header dans `functions.invoke()`
- La fonction Edge doit décider si elle accepte les requêtes anonymes ou authentifiées uniquement
