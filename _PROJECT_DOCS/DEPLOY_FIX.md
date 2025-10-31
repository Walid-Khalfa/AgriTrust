# Fix: 401 Missing Authorization Header

## Problème
L'erreur `401 Missing authorization header` survient car la configuration `verify_jwt = false` dans `supabase/config.toml` n'est **pas encore déployée** sur Supabase.

## Solution

### Option 1: Redéployer avec la nouvelle configuration (Recommandé)

Vous devez redéployer les fonctions pour appliquer `verify_jwt = false`:

```bash
# Déployer register-batch avec la nouvelle config
supabase functions deploy register-batch --no-verify-jwt

# Déployer test-hedera-credentials avec la nouvelle config  
supabase functions deploy test-hedera-credentials --no-verify-jwt
```

**Note**: Le flag `--no-verify-jwt` dans la commande de déploiement applique immédiatement la configuration sans JWT.

### Option 2: Tester avec un token utilisateur (Temporaire)

En attendant le redéploiement, testez avec un token d'authentification:

```bash
# 1. Obtenir un token utilisateur depuis votre app
# 2. Utiliser ce token dans les tests

curl -X POST \
  "${SUPABASE_URL}/functions/v1/register-batch" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -H "Authorization: Bearer YOUR_USER_ACCESS_TOKEN" \
  -d '{
    "productType": "Café Arabica",
    "quantity": "500",
    "location": "Dschang",
    "imageData": "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800",
    "harvestDate": "15-01-2025"
  }'
```

### Option 3: Modifier temporairement la fonction (Non recommandé)

Si vous ne pouvez pas redéployer immédiatement, vous pouvez modifier le code pour accepter les requêtes sans Authorization:

**Ceci est une solution temporaire - préférez le redéploiement avec `--no-verify-jwt`**

## Vérification après déploiement

Après redéploiement, testez:

```bash
./test-register-ui.sh
```

Vous devriez voir un succès (200) ou une erreur différente (validation, Hedera, etc.) mais **plus de 401**.

## Pourquoi cela arrive?

- `supabase/config.toml` est utilisé **uniquement lors du déploiement**
- Les fonctions déjà déployées conservent leur ancienne configuration
- Il faut redéployer pour appliquer les changements de configuration

## Commandes utiles

```bash
# Voir les logs de la fonction
supabase functions logs register-batch --limit 20

# Lister les fonctions déployées
supabase functions list

# Redéployer toutes les fonctions
supabase functions deploy
```
