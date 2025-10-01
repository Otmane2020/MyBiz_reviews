# Configuration Google OAuth pour Starlinko

## Problème résolu

L'erreur `Unable to exchange external code` était causée par une configuration incorrecte des URI de redirection OAuth.

## Solution appliquée

### 1. Corrections dans le code

**AuthPage.tsx et App.tsx** : Modification du `redirectTo` pour utiliser l'origine complète avec slash final :
```typescript
redirectTo: `${window.location.origin}/`
```

**Ajout de async/await** : Les fonctions `handleGoogleAuth` sont maintenant asynchrones pour gérer correctement la promesse OAuth.

### 2. Configuration Google Cloud Console

Vous devez configurer **EXACTEMENT** ces URIs de redirection dans Google Cloud Console :

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Sélectionnez votre projet
3. Allez dans **APIs & Services > Credentials**
4. Cliquez sur votre **OAuth 2.0 Client ID**
5. Dans **Authorized redirect URIs**, ajoutez :

```
https://gadwucduwbpddvtdyokr.supabase.co/auth/v1/callback
https://starlinko.pro/
https://starlinko.pro
```

**Note importante** : Ajoutez les trois URIs ci-dessus. Supabase gère la callback sur son domaine, puis redirige vers votre site.

### 3. Configuration Supabase Dashboard

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet
3. Allez dans **Authentication > Providers**
4. Trouvez **Google** et activez-le
5. Configurez :

**Client ID** : Votre Google Client ID
```
Exemple: 123456789-abcdefghijklmnop.apps.googleusercontent.com
```

**Client Secret** : Votre Google Client Secret
```
Exemple: GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**Scopes** (important !) :
```
https://www.googleapis.com/auth/business.manage
https://www.googleapis.com/auth/userinfo.profile
https://www.googleapis.com/auth/userinfo.email
```

**Redirect URL** : Laissez celle par défaut
```
https://gadwucduwbpddvtdyokr.supabase.co/auth/v1/callback
```

### 4. Vérifications supplémentaires

#### A. Écran de consentement OAuth

1. Dans Google Cloud Console > **OAuth consent screen**
2. **Publishing status** : Doit être en **Production** (ou Testing si vous testez)
3. **App domain** : Ajoutez `starlinko.pro`
4. **Authorized domains** : Ajoutez :
   - `starlinko.pro`
   - `supabase.co`

#### B. APIs activées

Dans Google Cloud Console > **APIs & Services > Library**, activez :

1. **Google My Business API** (déprécié mais peut être nécessaire)
2. **My Business Account Management API**
3. **My Business Business Information API**
4. **My Business Verifications API**
5. **My Business Place Actions API**

**⚠️ IMPORTANT** : Après activation, attendez 5-10 minutes avant de tester.

#### C. Demande d'accès aux quotas (si nécessaire)

Si vous voyez des quotas à 0 :

1. Allez dans **APIs & Services > Quotas**
2. Cherchez "My Business"
3. Demandez une augmentation de quotas si nécessaire
4. Google peut nécessiter une vérification de votre application

### 5. Variables d'environnement

Vérifiez que votre `.env` contient :

```env
# Frontend
VITE_SUPABASE_URL=https://gadwucduwbpddvtdyokr.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
VITE_GOOGLE_CLIENT_ID=votre_google_client_id

# Edge Functions (auto-configurées dans Supabase)
GOOGLE_CLIENT_ID=votre_google_client_id
GOOGLE_CLIENT_SECRET=votre_google_client_secret
DEEPSEEK_API_KEY=votre_deepseek_api_key
```

### 6. Test de la configuration

Pour tester si tout fonctionne :

1. Videz le cache de votre navigateur
2. Allez sur https://starlinko.pro
3. Cliquez sur "Se connecter avec Google"
4. Acceptez les permissions demandées
5. Vous devriez être redirigé vers https://starlinko.pro après authentification

### 7. Dépannage

#### Erreur "redirect_uri_mismatch"
- Vérifiez que les URIs de redirection dans Google Cloud Console correspondent EXACTEMENT
- Pas d'espaces, pas de caractères supplémentaires
- Incluez le protocole (https://)

#### Erreur "invalid_client"
- Vérifiez que le Client ID et Client Secret dans Supabase Dashboard correspondent à ceux de Google Cloud Console
- Regénérez un nouveau Client Secret si nécessaire

#### Erreur "access_denied"
- L'utilisateur a refusé les permissions
- Ou votre app n'est pas en Production dans l'écran de consentement

#### Erreur "insufficient_permissions"
- Les scopes ne sont pas correctement configurés
- Vérifiez que `business.manage` est bien dans la liste des scopes

### 8. Flux OAuth complet

```
1. Utilisateur clique "Se connecter avec Google"
   ↓
2. Frontend appelle supabase.auth.signInWithOAuth()
   ↓
3. Supabase redirige vers Google OAuth
   ↓
4. Utilisateur accepte les permissions
   ↓
5. Google redirige vers https://gadwucduwbpddvtdyokr.supabase.co/auth/v1/callback
   ↓
6. Supabase traite le callback et crée la session
   ↓
7. Supabase redirige vers https://starlinko.pro/
   ↓
8. Frontend détecte la session et charge l'app
```

### 9. Logs utiles

Pour déboguer, consultez :

1. **Console navigateur** : Logs frontend
2. **Supabase Dashboard > Auth > Logs** : Logs d'authentification
3. **Supabase Dashboard > Edge Functions > Logs** : Logs des fonctions
4. **Google Cloud Console > Logs Explorer** : Logs des APIs Google

### 10. Checklist finale

- [ ] URIs de redirection ajoutées dans Google Cloud Console
- [ ] Client ID et Secret configurés dans Supabase
- [ ] Scopes `business.manage` ajoutés
- [ ] APIs Google activées
- [ ] Écran de consentement en Production
- [ ] Domaines autorisés ajoutés
- [ ] Variables d'environnement configurées
- [ ] Code déployé avec les corrections
- [ ] Cache navigateur vidé
- [ ] Test OAuth réussi

## Support

Si le problème persiste après avoir suivi toutes ces étapes :

1. Vérifiez les logs Supabase Auth
2. Vérifiez les logs Google Cloud
3. Testez avec un navigateur en mode incognito
4. Attendez 10-15 minutes après les changements de configuration
