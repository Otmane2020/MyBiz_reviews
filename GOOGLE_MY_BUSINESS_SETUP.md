# Configuration Google My Business - Guide de Diagnostic

## État actuel de l'intégration

L'application a été mise à jour pour utiliser les **nouvelles APIs Google Business Profile v1** (2024-2025) qui remplacent les anciennes APIs v4 dépréciées.

## Prérequis obligatoires

### 1. Configuration Google Cloud Console

Vous DEVEZ activer les APIs suivantes dans Google Cloud Console:

1. **My Business Account Management API** - Pour récupérer les comptes
2. **My Business Business Information API** - Pour récupérer les établissements
3. **My Business Verifications API** - Pour les vérifications
4. **Google OAuth2 API** - Pour l'authentification

**Comment activer les APIs:**
1. Allez sur https://console.cloud.google.com/apis/dashboard
2. Cliquez sur "+ ACTIVER DES API ET DES SERVICES"
3. Recherchez chaque API et cliquez sur "ACTIVER"
4. Attendez 5-10 minutes après activation

### 2. Créer des identifiants OAuth 2.0

1. Allez sur https://console.cloud.google.com/apis/credentials
2. Cliquez sur "+ CRÉER DES IDENTIFIANTS" > "ID client OAuth"
3. Type d'application: "Application Web"
4. Nom: "Starlinko App"
5. **Origines JavaScript autorisées:**
   - `http://localhost:5173`
   - `https://votre-domaine.com`
6. **URI de redirection autorisés:**
   - `http://localhost:5173`
   - `https://votre-domaine.com`
   - `https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback`
7. Cliquez sur "CRÉER"
8. Copiez le **Client ID** et le **Client Secret**

### 3. Configuration Supabase

#### A. Dashboard Supabase - Provider OAuth Google

1. Allez sur https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/auth/providers
2. Cherchez "Google" dans la liste des providers
3. Activez le provider Google
4. Collez votre **Google Client ID**
5. Collez votre **Google Client Secret**
6. Ajoutez les scopes OAuth:
   ```
   https://www.googleapis.com/auth/business.manage
   https://www.googleapis.com/auth/userinfo.profile
   https://www.googleapis.com/auth/userinfo.email
   ```
7. Sauvegardez

#### B. Secrets des Edge Functions

Les secrets sont automatiquement configurés lors du déploiement des Edge Functions. Vous n'avez rien à faire manuellement.

### 4. Variables d'environnement locales

Dans votre fichier `.env` local:

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
VITE_GOOGLE_CLIENT_ID=votre_google_client_id
```

## Diagnostic des erreurs courantes

### Erreur: "Google credentials not configured"

**Cause:** Les secrets GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET ne sont pas configurés dans Supabase Edge Functions.

**Solution:** Les secrets sont automatiquement configurés. Si l'erreur persiste, vérifiez que vous avez bien déployé les Edge Functions.

### Erreur 401: "Unauthorized"

**Cause:** Le token d'accès Google a expiré ou est invalide.

**Solutions:**
1. Cliquez sur "Reconnecter Google" dans l'interface
2. Vérifiez que les scopes OAuth incluent `business.manage`
3. Vérifiez que l'utilisateur a autorisé l'accès à Google My Business

### Erreur 403: "Permission denied"

**Cause:** Les APIs Google Business Profile ne sont pas activées.

**Solution:**
1. Vérifiez que TOUTES les APIs listées ci-dessus sont activées
2. Attendez 5-10 minutes après activation
3. Réessayez la connexion

### Erreur 404: "Not found" ou "No accounts found"

**Causes possibles:**
1. L'utilisateur n'a pas de compte Google Business Profile
2. L'utilisateur n'a pas les permissions sur le compte
3. Le compte n'a pas d'établissement configuré

**Solutions:**
1. Créez un compte Google Business Profile: https://business.google.com
2. Ajoutez au moins un établissement
3. Vérifiez que vous êtes propriétaire ou gestionnaire du compte
4. Réessayez après avoir créé l'établissement

## Architecture technique

### Edge Functions déployées

1. **google-oauth** (déployée ✅)
   - Endpoint: `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/google-oauth`
   - Actions: `exchange-code`, `refresh-token`, `get-accounts`, `get-locations`, `reply-review`
   - CORS: Activé pour tous les domaines

2. **fetch-reviews** (déployée ✅)
   - Endpoint: `https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/fetch-reviews`
   - Récupère et stocke les avis Google dans Supabase
   - CORS: Activé pour tous les domaines

### APIs Google utilisées

- `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` - Liste des comptes
- `https://mybusinessbusinessinformation.googleapis.com/v1/{accountId}/locations` - Liste des établissements
- `https://mybusiness.googleapis.com/v4/{locationId}/reviews` - Liste des avis

### Flux d'authentification

1. L'utilisateur clique sur "Connecter Google"
2. Supabase redirige vers Google OAuth avec les scopes appropriés
3. L'utilisateur autorise l'accès
4. Google redirige vers Supabase avec un code d'autorisation
5. Supabase échange le code contre un access_token et refresh_token
6. L'access_token est utilisé pour appeler les APIs Google Business Profile
7. Les données sont récupérées et affichées dans l'interface

## Logs de diagnostic

Les Edge Functions loggent toutes les étapes importantes avec des emojis pour faciliter le diagnostic:

- ✅ = Succès
- ❌ = Erreur
- 📡 = Requête API en cours
- 📥 = Réponse API reçue
- 📦 = Données reçues
- 🔑 = Token d'accès
- 🔄 = Action en cours

**Comment voir les logs:**
1. Allez sur https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/functions
2. Cliquez sur la fonction (google-oauth ou fetch-reviews)
3. Allez dans l'onglet "Logs"
4. Reproduisez l'erreur
5. Consultez les logs pour identifier le problème exact

## Test manuel de l'API

Vous pouvez tester manuellement l'Edge Function avec curl:

```bash
curl -X POST \
  https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/google-oauth \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_SUPABASE_ANON_KEY" \
  -d '{
    "action": "get-accounts",
    "accessToken": "VOTRE_GOOGLE_ACCESS_TOKEN"
  }'
```

## Prochaines étapes si le problème persiste

1. Vérifiez les logs des Edge Functions dans Supabase Dashboard
2. Vérifiez que les APIs Google sont bien activées et attendez 5-10 minutes
3. Vérifiez que l'OAuth Google est configuré dans Supabase avec les bons scopes
4. Testez avec un compte Google qui possède déjà un établissement Google Business Profile
5. Vérifiez que les URIs de redirection correspondent exactement

## Contact et support

Si après avoir suivi toutes ces étapes le problème persiste, notez:
- Le message d'erreur exact
- Les logs des Edge Functions
- Le statut HTTP de la réponse
- L'action qui échoue (get-accounts, get-locations, etc.)
