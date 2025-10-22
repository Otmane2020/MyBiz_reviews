# Configuration Google Maps API et Google My Business

## 1. Configuration de la clé API Google Maps

### Étape 1 : Créer/Configurer la clé API
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un projet ou sélectionnez un projet existant
3. Activez les APIs suivantes :
   - **Places API** (obligatoire pour la recherche)
   - **Places API (New)** (recommandé)
   - **Geocoding API** (optionnel)

4. Créez une clé API :
   - API & Services → Credentials → Create Credentials → API Key
   - Copiez la clé générée : `AIzaSyD1s73rZidQJRF1TfRzpxRx6e_pTdFUEPc`

### Étape 2 : Configurer les restrictions (IMPORTANT)
1. Cliquez sur la clé API créée
2. Dans "API restrictions" :
   - Sélectionnez "Restrict key"
   - Cochez : **Places API**
3. Dans "Application restrictions" :
   - Sélectionnez "HTTP referrers (web sites)"
   - Ajoutez : `https://*.supabase.co/*`
   - Ajoutez : `https://yourdomain.com/*` (votre domaine)
   - Ajoutez : `http://localhost:*` (pour le développement)

### Étape 3 : Ajouter le secret dans Supabase
1. Allez sur : https://supabase.com/dashboard/project/gadwucduwbpddvtdyokr/settings/vault/secrets
2. Cliquez sur **"New secret"**
3. Créez le secret :
   - **Name** : `GOOGLE_MAPS_API_KEY` ou `GOOGLE_API_KEY`
   - **Value** : `AIzaSyD1s73rZidQJRF1TfRzpxRx6e_pTdFUEPc`
4. Cliquez sur **"Save"**

⚠️ **IMPORTANT** : Sans ce secret, l'Edge Function ne pourra pas accéder à l'API Google Maps.

## 2. Configuration Google My Business (OAuth)

### Étape 1 : Configurer OAuth dans Google Cloud Console
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. API & Services → Credentials
3. Cliquez sur "OAuth 2.0 Client IDs" ou créez-en un nouveau
4. Type d'application : **Application Web**
5. Ajoutez les URIs de redirection autorisés :
   ```
   https://gadwucduwbpddvtdyokr.supabase.co/auth/v1/callback
   ```

### Étape 2 : Activer les APIs nécessaires
Activez ces APIs dans Google Cloud Console :
- **Google My Business API**
- **My Business Business Information API**
- **My Business Account Management API**

### Étape 3 : Configurer OAuth dans Supabase
1. Allez sur : https://supabase.com/dashboard/project/gadwucduwbpddvtdyokr/auth/providers
2. Activez le provider **Google**
3. Ajoutez :
   - **Client ID** : Depuis Google Cloud Console
   - **Client Secret** : Depuis Google Cloud Console
4. Sauvegardez

### Étape 4 : Tester la connexion
1. Allez dans l'application → "Mes établissements"
2. Cliquez sur "Connecter Google My Business"
3. Autorisez l'accès à votre compte Google Business

## 3. Vérification

### Test de la recherche d'établissement :
1. Allez dans "Mes établissements" → "Ajouter un établissement"
2. Tapez au moins 3 caractères (ex: "Restaurant")
3. Les suggestions devraient apparaître automatiquement

### Test de l'importation des avis :
1. Sélectionnez un établissement dans les résultats
2. L'établissement devrait être ajouté automatiquement
3. Les avis Google devraient être importés dans la base de données

## 4. Dépannage

### Erreur "API key invalide ou restrictions activées"
- Vérifiez que le secret `GOOGLE_MAPS_API_KEY` est bien configuré dans Supabase
- Vérifiez que Places API est activée dans Google Cloud Console
- Vérifiez les restrictions HTTP referrers

### "Rien ne se passe" avec Google My Business
- Vérifiez que le provider Google OAuth est activé dans Supabase
- Vérifiez que les URIs de redirection sont corrects
- Vérifiez que les APIs Google My Business sont activées
- Consultez la console du navigateur pour voir les erreurs

### Les avis ne s'importent pas
- Vérifiez que l'établissement a des avis Google
- Consultez les logs de l'Edge Function dans Supabase
- Vérifiez que la table `reviews` existe dans la base de données
