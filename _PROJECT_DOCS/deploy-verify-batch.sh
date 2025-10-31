#!/bin/bash

# Script de déploiement complet pour verify-batch
# Exécuter après avoir configuré les secrets

set -e

echo "🚀 Déploiement de verify-batch"
echo ""

# Vérifier que les secrets sont configurés
echo "📋 Étape 1: Vérification des secrets"
echo "Assurez-vous d'avoir configuré les secrets suivants:"
echo "  - SUPABASE_URL"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Pour configurer les secrets:"
echo "  supabase secrets set SUPABASE_URL=\"https://mrbfrwtymikayrbrzgmp.supabase.co\""
echo "  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"<votre_service_role_key>\""
echo ""
read -p "Les secrets sont-ils configurés? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ Configurez les secrets avant de continuer"
    exit 1
fi

# Déployer la fonction
echo "📦 Étape 2: Déploiement de la fonction"
supabase functions deploy verify-batch

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Prochaines étapes:"
echo "  1. Vérifier les logs: supabase functions logs verify-batch --follow"
echo "  2. Tester avec curl: ./test-verify-complete.sh"
echo "  3. Tester avec SDK: tsx test-verify-sdk.ts"
echo "  4. Tester depuis l'interface: /verify/0.0.7160982/1"
