# 🧪 Guide de Tests End-to-End Manuel - AgriTrust
## Préparation pour la Vidéo Démo du Hedera Africa Hackathon 2025

---

## 📋 **Pré-requis avant les tests**

### ✅ Vérifications techniques
- [ ] Backend démarré (`cd backend && npm start`)
- [ ] Frontend démarré (`pnpm dev`)
- [ ] Variables d'environnement configurées (`.env` backend + frontend)
- [ ] Wallet HashPack installé et configuré sur testnet
- [ ] Compte testnet avec HBAR (minimum 5 HBAR pour les tests)
- [ ] Connexion Internet stable
- [ ] Navigateur moderne (Chrome/Firefox recommandé)

### 📸 Préparation des données de test
- [ ] 3-5 photos de produits agricoles africains (café, cacao, mangues, etc.)
- [ ] Photos de bonne qualité (min 800x600px)
- [ ] Noms de producteurs réalistes
- [ ] Localisations africaines authentiques (Ghana, Kenya, Côte d'Ivoire, etc.)

---

## 🎯 **PHASE 1 : Authentification & Profil**

### Test 1.1 : Connexion avec HashPack
**Objectif** : Vérifier l'intégration Hedera wallet

**Étapes** :
1. Ouvrir l'application (`http://localhost:5173`)
2. Cliquer sur "Se connecter avec HashPack"
3. Approuver la connexion dans HashPack
4. Vérifier que l'adresse du compte s'affiche dans la navbar

**Critères de succès** :
- ✅ Popup HashPack s'ouvre correctement
- ✅ Connexion réussie sans erreur
- ✅ Account ID affiché dans la navbar (format: 0.0.xxxxx)
- ✅ Redirection automatique vers la page d'accueil

**Points à noter pour la démo** :
- Temps de connexion (devrait être < 5 secondes)
- Fluidité de l'expérience utilisateur

---

### Test 1.2 : Profil utilisateur
**Objectif** : Vérifier la gestion du profil

**Étapes** :
1. Naviguer vers "Profil" dans la navbar
2. Compléter le formulaire :
   - Nom : "Kofi Mensah"
   - Email : "kofi@agritrust.africa"
   - Rôle : "Producteur"
   - Localisation : "Kumasi, Ghana"
3. Sauvegarder le profil
4. Rafraîchir la page
5. Vérifier que les données persistent

**Critères de succès** :
- ✅ Formulaire s'affiche correctement
- ✅ Sauvegarde réussie avec message de confirmation
- ✅ Données persistent après rafraîchissement
- ✅ Pas d'erreurs dans la console

---

## 🌾 **PHASE 2 : Enregistrement de Lot (Batch Registration)**

### Test 2.1 : Enregistrement basique
**Objectif** : Créer un lot agricole avec AI

**Étapes** :
1. Naviguer vers "Enregistrer un lot"
2. Remplir le formulaire :
   - **Nom du lot** : "Café Arabica Premium - Récolte Janvier 2025"
   - **Type de produit** : "Café"
   - **Quantité** : "500"
   - **Unité** : "kg"
   - **Producteur** : "Coopérative Café Vert - Abidjan"
   - **Localisation** : "Abidjan, Côte d'Ivoire"
   - **Date de récolte** : Sélectionner une date récente
3. **Uploader une photo** de grains de café
4. Attendre l'analyse AI (15-30 secondes)
5. Vérifier le feedback AI généré
6. Soumettre le formulaire

**Critères de succès** :
- ✅ Upload d'image fonctionne (preview visible)
- ✅ Analyse AI retourne un feedback pertinent en français
- ✅ Message de succès affiché
- ✅ Topic ID Hedera retourné (format: 0.0.xxxxx)
- ✅ Pas d'erreurs réseau ou serveur

**Points critiques pour la démo** :
- **Qualité du feedback AI** : Doit mentionner qualité, fraîcheur, authenticité
- **Temps de réponse** : < 30 secondes total
- **Message de succès clair** avec Topic ID visible

---

### Test 2.2 : Validation des champs
**Objectif** : Vérifier la robustesse du formulaire

**Étapes** :
1. Essayer de soumettre le formulaire vide
2. Remplir seulement quelques champs
3. Essayer sans photo
4. Essayer avec une photo trop grande (> 5MB)

**Critères de succès** :
- ✅ Messages d'erreur clairs pour champs manquants
- ✅ Validation côté client fonctionne
- ✅ Gestion des erreurs d'upload
- ✅ Feedback utilisateur approprié

---

### Test 2.3 : Cas d'usage réaliste africain
**Objectif** : Tester avec données authentiques

**Créer 3 lots différents** :

**Lot 1 - Cacao du Ghana** :
- Nom : "Cacao Bio Certifié - Ashanti Region"
- Type : "Cacao"
- Quantité : 1000 kg
- Producteur : "Kuapa Kokoo Cooperative"
- Localisation : "Kumasi, Ghana"
- Photo : Fèves de cacao

**Lot 2 - Mangues du Kenya** :
- Nom : "Mangues Kent Export Quality"
- Type : "Fruits"
- Quantité : 300 kg
- Producteur : "Mwangi Farms"
- Localisation : "Machakos, Kenya"
- Photo : Mangues mûres

**Lot 3 - Thé d'Éthiopie** :
- Nom : "Thé Vert Biologique - Highlands"
- Type : "Thé"
- Quantité : 200 kg
- Producteur : "Ethiopian Tea Growers"
- Localisation : "Addis-Abeba, Éthiopie"
- Photo : Feuilles de thé

**Critères de succès** :
- ✅ Les 3 lots créés avec succès
- ✅ Topic IDs différents pour chaque lot
- ✅ Feedback AI pertinent pour chaque produit
- ✅ Données stockées correctement

---

## 🔗 **PHASE 3 : Tokenisation NFT (HTS)**

### Test 3.1 : Tokenisation d'un lot
**Objectif** : Créer un NFT Hedera pour traçabilité

**Étapes** :
1. Naviguer vers "Tokeniser un lot"
2. Sélectionner un lot créé précédemment (ex: Café Arabica)
3. Remplir les métadonnées NFT :
   - **Nom du token** : "AGRI-CAFE-001"
   - **Symbole** : "CAFE"
   - **Description** : "NFT de traçabilité pour Café Arabica Premium"
4. Cliquer sur "Créer NFT"
5. Approuver la transaction dans HashPack
6. Attendre la confirmation (30-60 secondes)

**Critères de succès** :
- ✅ Formulaire pré-rempli avec données du lot
- ✅ Transaction HashPack s'ouvre correctement
- ✅ NFT créé avec succès
- ✅ Token ID retourné (format: 0.0.xxxxx)
- ✅ Message de confirmation avec lien vers HashScan
- ✅ Coût en HBAR affiché

**Points critiques pour la démo** :
- **Montrer la transaction sur HashScan** (explorer Hedera)
- **Expliquer l'immutabilité** du NFT
- **Mettre en avant la traçabilité blockchain**

---

### Test 3.2 : Vérification sur HashScan
**Objectif** : Prouver l'enregistrement blockchain

**Étapes** :
1. Copier le Token ID du NFT créé
2. Ouvrir HashScan testnet : `https://hashscan.io/testnet`
3. Rechercher le Token ID
4. Vérifier les métadonnées
5. Vérifier le propriétaire (votre account ID)

**Critères de succès** :
- ✅ NFT visible sur HashScan
- ✅ Métadonnées correctes
- ✅ Propriétaire correct
- ✅ Timestamp de création visible

---

## ✅ **PHASE 4 : Vérification de Provenance**

### Test 4.1 : Vérification par Topic ID
**Objectif** : Tracer l'historique d'un lot

**Étapes** :
1. Naviguer vers "Vérifier un lot"
2. Entrer le Topic ID d'un lot créé
3. Cliquer sur "Vérifier"
4. Examiner les résultats :
   - Informations du lot
   - Historique des événements HCS
   - Résumé AI de provenance
   - Timeline de traçabilité

**Critères de succès** :
- ✅ Données du lot affichées correctement
- ✅ Historique HCS complet
- ✅ Résumé AI généré en français
- ✅ Timeline claire et lisible
- ✅ Toutes les étapes visibles (création, tokenisation si applicable)

**Points critiques pour la démo** :
- **Résumé AI de provenance** : Doit être clair, professionnel, rassurant
- **Transparence totale** : Montrer toutes les étapes
- **Immutabilité** : Expliquer que les données ne peuvent pas être modifiées

---

### Test 4.2 : Vérification par Token ID
**Objectif** : Vérifier via NFT

**Étapes** :
1. Utiliser le Token ID d'un NFT créé
2. Vérifier la provenance
3. Comparer avec les données du Topic ID

**Critères de succès** :
- ✅ Données cohérentes entre Topic et Token
- ✅ Lien entre HCS et HTS visible
- ✅ Résumé AI complet

---

### Test 4.3 : Questions acheteur AI
**Objectif** : Tester l'assistant AI pour acheteurs

**Étapes** :
1. Sur la page de vérification d'un lot
2. Poser des questions dans le chat AI :
   - "Ce café est-il biologique ?"
   - "Quelle est la fraîcheur du produit ?"
   - "Puis-je faire confiance à ce producteur ?"
   - "Quelles sont les certifications ?"
3. Vérifier les réponses AI

**Critères de succès** :
- ✅ Réponses pertinentes et contextuelles
- ✅ Réponses en français
- ✅ Temps de réponse < 10 secondes
- ✅ Réponses basées sur les données du lot

---

## 🌍 **PHASE 5 : Expérience Utilisateur & Performance**

### Test 5.1 : Navigation & Responsive
**Objectif** : Vérifier l'UX globale

**Étapes** :
1. Tester la navbar sur desktop
2. Tester le menu hamburger sur mobile (DevTools)
3. Naviguer entre toutes les pages
4. Vérifier les transitions
5. Tester les dropdowns

**Critères de succès** :
- ✅ Navigation fluide
- ✅ Responsive sur mobile/tablet/desktop
- ✅ Menu hamburger fonctionne
- ✅ Pas de bugs visuels
- ✅ Temps de chargement < 3 secondes

---

### Test 5.2 : Gestion des erreurs
**Objectif** : Vérifier la robustesse

**Scénarios à tester** :
1. Déconnecter le backend → Vérifier messages d'erreur
2. Rejeter une transaction HashPack → Vérifier gestion
3. Upload d'image invalide → Vérifier validation
4. Topic ID inexistant → Vérifier message clair

**Critères de succès** :
- ✅ Messages d'erreur clairs et en français
- ✅ Pas de crash de l'application
- ✅ Possibilité de réessayer
- ✅ Feedback utilisateur approprié

---

### Test 5.3 : Performance & Temps de réponse
**Objectif** : Mesurer la rapidité

**Métriques à noter** :
- ⏱️ Temps de connexion HashPack : _____ secondes
- ⏱️ Temps d'analyse AI (image) : _____ secondes
- ⏱️ Temps de création HCS topic : _____ secondes
- ⏱️ Temps de création NFT : _____ secondes
- ⏱️ Temps de vérification : _____ secondes
- ⏱️ Temps de réponse AI chat : _____ secondes

**Objectifs** :
- Connexion : < 5s
- Analyse AI : < 30s
- HCS topic : < 10s
- NFT : < 60s
- Vérification : < 5s
- AI chat : < 10s

---

## 🎬 **PHASE 6 : Préparation Scénario Vidéo Démo**

### Scénario recommandé (3 minutes max)

**[0:00-0:20] Introduction (20s)**
- Problème : Fraude alimentaire en Afrique
- Solution : AgriTrust avec Hedera + AI
- Montrer la page d'accueil

**[0:20-0:50] Enregistrement d'un lot (30s)**
- Connexion HashPack rapide
- Remplir formulaire avec données africaines authentiques
- Upload photo de café/cacao
- Montrer feedback AI en temps réel
- Succès avec Topic ID

**[0:50-1:20] Tokenisation NFT (30s)**
- Sélectionner le lot créé
- Créer NFT avec métadonnées
- Approuver transaction HashPack
- Montrer Token ID et lien HashScan
- Expliquer immutabilité blockchain

**[1:20-2:00] Vérification de provenance (40s)**
- Entrer Topic ID
- Montrer historique complet HCS
- Afficher résumé AI de provenance
- Poser 2 questions à l'AI :
  - "Ce produit est-il authentique ?"
  - "Quelle est sa fraîcheur ?"
- Montrer réponses AI pertinentes

**[2:00-2:40] Impact & Différenciation (40s)**
- Montrer support multilingue (français/anglais)
- Expliquer intégration Hedera (HCS + HTS)
- Mettre en avant AI Gemini 2.5 Flash
- Montrer responsive mobile
- Expliquer cas d'usage ESG

**[2:40-3:00] Conclusion & Call-to-Action (20s)**
- Récapitulatif : Transparence + Confiance + Technologie
- Impact pour l'Afrique
- Remerciements jury
- Logo Hedera + AgriTrust

---

## 📊 **Checklist finale avant enregistrement vidéo**

### Données de démo
- [ ] Au moins 3 lots créés avec données africaines réalistes
- [ ] Au moins 1 NFT tokenisé
- [ ] Photos de haute qualité
- [ ] Noms de producteurs authentiques
- [ ] Localisations africaines variées

### Technique
- [ ] Backend et frontend démarrés sans erreurs
- [ ] Wallet HashPack connecté avec HBAR suffisant
- [ ] Console navigateur propre (pas d'erreurs critiques)
- [ ] Connexion Internet stable
- [ ] Écran enregistré en 1080p minimum

### Contenu
- [ ] Scénario écrit et répété
- [ ] Timing respecté (< 3 minutes)
- [ ] Points clés préparés :
  - Problème résolu
  - Intégration Hedera (HCS + HTS)
  - AI Gemini pour analyse et provenance
  - Support multilingue
  - Impact ESG Afrique
- [ ] Transitions fluides entre sections

### Présentation
- [ ] Voix claire et professionnelle
- [ ] Rythme dynamique
- [ ] Pas de temps morts
- [ ] Montrer les fonctionnalités clés
- [ ] Mettre en avant la différenciation

---

## 🏆 **Points à mettre en avant pour les juges**

### Innovation (25%)
- ✨ Combinaison unique Hedera HCS + HTS + AI Gemini
- ✨ Analyse d'image AI pour authenticité
- ✨ Résumé de provenance AI multilingue
- ✨ Assistant AI pour questions acheteurs

### Exécution Technique (25%)
- 🔧 Intégration complète Hedera (consensus + tokens)
- 🔧 Backend Node.js robuste avec Supabase
- 🔧 Frontend React moderne avec shadcn/ui
- 🔧 AI Gemini 2.5 Flash pour analyse avancée

### Impact Réel (25%)
- 🌍 Résout la fraude alimentaire en Afrique
- 🌍 Empowerment des petits producteurs
- 🌍 Transparence pour consommateurs
- 🌍 Traçabilité ESG pour entreprises

### UX/UI (15%)
- 🎨 Interface intuitive et professionnelle
- 🎨 Responsive mobile-first
- 🎨 Support multilingue (français/anglais)
- 🎨 Feedback temps réel

### Présentation (10%)
- 🎤 Démo claire et convaincante
- 🎤 Cas d'usage africain authentique
- 🎤 Vidéo professionnelle < 3 minutes

---

## ✅ **Validation finale**

Avant de déclarer les tests terminés :

- [ ] Tous les tests PHASE 1-5 passés avec succès
- [ ] Au moins 3 lots créés avec données réalistes
- [ ] Au moins 1 NFT tokenisé et vérifié sur HashScan
- [ ] Vérification de provenance testée avec succès
- [ ] AI chat testé avec questions pertinentes
- [ ] Performance mesurée et acceptable
- [ ] Pas d'erreurs critiques dans la console
- [ ] Scénario vidéo préparé et répété
- [ ] Checklist finale complétée

---

## 📝 **Notes pour la vidéo démo**

**Ce qui impressionnera les juges** :
1. **Fluidité** : Pas d'hésitation, transitions rapides
2. **Données réalistes** : Produits africains authentiques
3. **Technologie visible** : Montrer HashPack, HashScan, AI en action
4. **Impact clair** : Expliquer le problème résolu
5. **Différenciation** : HCS + HTS + AI = unique

**Erreurs à éviter** :
- ❌ Temps morts ou chargements longs
- ❌ Données de test génériques ("Test 1", "Product A")
- ❌ Erreurs techniques visibles
- ❌ Explication trop technique
- ❌ Dépasser 3 minutes

**Astuce finale** :
Enregistrez 2-3 prises et gardez la meilleure. Montrez votre passion pour résoudre un vrai problème africain avec une technologie innovante !

---

**Bonne chance pour le Hedera Africa Hackathon 2025 ! 🚀🌍**
