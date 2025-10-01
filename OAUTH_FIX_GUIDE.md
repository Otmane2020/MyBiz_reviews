# 🔧 Guide Rapide - Résolution Erreur OAuth

## ❌ Erreur actuelle
```
Unable to exchange external code
```

## ✅ Solution en 3 étapes

### Étape 1 : Configuration Google Cloud Console

1. Allez sur [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Cliquez sur votre **OAuth 2.0 Client ID**
3. Dans **"Authorized redirect URIs"**, ajoutez **EXACTEMENT** ces 4 URIs :

```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
http://localhost:5173/
https://starlinko.pro/
https://starlinko.pro
```

⚠️ **IMPORTANT** :
- Copiez-collez exactement, sans espaces
- Incluez le `/` à la fin pour localhost et starlinko.pro
- La première ligne (Supabase callback) est OBLIGATOIRE

4. Cliquez sur **"SAVE"** (en bas)

### Étape 2 : Configuration Supabase Dashboard

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f)
2. Allez dans **Authentication > Providers**
3. Trouvez **Google** et cliquez dessus
4. Activez le provider si ce n'est pas fait
5. Remplissez :

**Google Client ID** :
```
(Copiez depuis Google Cloud Console)
```

**Google Client Secret** :
```
(Copiez depuis Google Cloud Console)
```

**Authorized Client IDs** : Laissez vide

**Skip nonce check** : Décoché

**Additional Scopes** (⚠️ CRITIQUE) :
```
https://www.googleapis.com/auth/business.manage
```

6. Cliquez sur **"Save"**

### Étape 3 : Vérification OAuth Consent Screen

1. Dans Google Cloud Console, allez dans **OAuth consent screen**
2. Vérifiez que :
   - **Publishing status** = "In production" (ou "Testing" pour les tests)
   - **Authorized domains** contient : `starlinko.pro` et `supabase.co`
   - **Scopes** inclut au minimum :
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `.../auth/business.manage` (ajoutez-le manuellement si absent)

## 🧪 Test

1. **Videz le cache du navigateur** (Ctrl+Shift+Delete)
2. Allez sur `http://localhost:5173`
3. Cliquez sur **"Se connecter avec Google"**
4. Acceptez les permissions
5. Vous devriez être redirigé vers l'app

## 🐛 Si ça ne marche toujours pas

### Vérification 1 : Logs Supabase

1. Allez sur [Supabase Logs](https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/logs/auth-logs)
2. Cherchez les erreurs récentes
3. Regardez si vous voyez "Unable to exchange" ou autre erreur

### Vérification 2 : Client ID et Secret

Dans Google Cloud Console, vérifiez que vous utilisez le bon projet :

```bash
# Le Client ID doit ressembler à :
123456789-abcdefghijklmnop.apps.googleusercontent.com

# Le Client Secret doit ressembler à :
GOCSPX-abcdefghijklmnopqrstuvwxyz
```

**Vérifiez qu'ils sont identiques dans** :
- Google Cloud Console > Credentials
- Supabase Dashboard > Auth > Providers > Google

### Vérification 3 : APIs activées

Dans Google Cloud Console > **APIs & Services > Library**, recherchez et activez :

1. ✅ **My Business Account Management API**
2. ✅ **My Business Business Information API**
3. ✅ **My Business Verifications API**

⏰ Attendez **5-10 minutes** après activation

### Vérification 4 : Variables d'environnement

Votre `.env` doit contenir :

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

## 📋 Checklist finale

Cochez chaque élément :

- [ ] URIs de redirection ajoutées dans Google Cloud Console (4 URIs)
- [ ] Client ID configuré dans Supabase Dashboard
- [ ] Client Secret configuré dans Supabase Dashboard
- [ ] Scope `business.manage` ajouté dans Supabase
- [ ] OAuth consent screen en Production
- [ ] Domaines autorisés : `starlinko.pro` et `supabase.co`
- [ ] APIs Google activées (attendu 10 minutes)
- [ ] Cache navigateur vidé
- [ ] Testé en mode incognito

## 🆘 Toujours bloqué ?

Si après avoir suivi TOUTES les étapes, ça ne marche pas :

1. **Attendez 15 minutes** (propagation des configs Google)
2. **Testez en mode incognito**
3. **Regardez les logs Supabase Auth**
4. **Copiez l'erreur exacte** et vérifiez :
   - `redirect_uri_mismatch` → URIs mal configurées
   - `invalid_client` → Client ID/Secret incorrect
   - `access_denied` → Permissions refusées ou consent screen
   - `insufficient_scope` → Scopes manquants

## 💡 Astuce finale

Si vous avez modifié des configurations dans Google Cloud Console :
- Attendez 10-15 minutes avant de tester
- Google met du temps à propager les changements
- Testez toujours en mode incognito après un changement
