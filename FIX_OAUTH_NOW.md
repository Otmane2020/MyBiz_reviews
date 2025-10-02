# ✅ OAuth Direct - Configuration Simple

## 🎯 Ce qui a changé

Nous avons **contourné Supabase OAuth** qui causait l'erreur "Unable to exchange external code".

Maintenant, OAuth est géré **directement** par votre app via une Edge Function.

## 📋 Configuration - 3 étapes simples

### ÉTAPE 1 : Google Cloud Console

1. Allez sur : https://console.cloud.google.com/apis/credentials

2. Cliquez sur votre **OAuth 2.0 Client ID**

3. Dans **"Authorized redirect URIs"**, remplacez TOUTES les URIs par :

```
http://localhost:5173/oauth/callback
https://starlinko.pro/oauth/callback
```

**Supprimez toutes les autres URIs** (surtout celle de Supabase)

4. **SAVE**

5. **Copiez vos identifiants** :
   - Client ID
   - Client Secret

---

### ÉTAPE 2 : Variables d'environnement .env

Ouvrez votre fichier `.env` et remplacez les valeurs :

```env
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw

VITE_GOOGLE_CLIENT_ID=VOTRE_CLIENT_ID_ICI
VITE_GOOGLE_CLIENT_SECRET=VOTRE_CLIENT_SECRET_ICI
```

Remplacez :
- `VITE_GOOGLE_CLIENT_ID` par votre Client ID Google
- `VITE_GOOGLE_CLIENT_SECRET` par votre Client Secret Google

---

### ÉTAPE 3 : Variables Supabase Edge Function

Les Edge Functions ont besoin des mêmes variables. Allez sur :

https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/settings/functions

Ajoutez ces **secrets** :

| Name | Value |
|------|-------|
| `GOOGLE_CLIENT_ID` | Votre Client ID Google |
| `GOOGLE_CLIENT_SECRET` | Votre Client Secret Google |
| `GOOGLE_REDIRECT_URI` | `http://localhost:5173/oauth/callback` |

---

## 🧪 Test

1. **Redémarrez le dev server** :
```bash
npm run dev
```

2. Ouvrez : `http://localhost:5173`

3. Cliquez sur **"Se connecter avec Google"**

4. Vous devriez :
   - Être redirigé vers Google
   - Autoriser l'accès
   - Être redirigé vers `/oauth/callback`
   - Voir un écran de chargement
   - Être connecté à l'app

---

## ✅ Comment ça marche maintenant

### Avant (qui ne marchait pas) :
```
App → Supabase OAuth → Google → Supabase → ❌ ERROR
```

### Maintenant (qui marche) :
```
App → Edge Function → Google → App Callback → Create Supabase Session → ✅ SUCCESS
```

---

## 🔧 Troubleshooting

### Erreur : "Redirect URI mismatch"

Vérifiez que dans Google Cloud Console, vous avez **EXACTEMENT** :
```
http://localhost:5173/oauth/callback
```

Pas de slash à la fin, pas de `www.`, protocole `http://` pour localhost.

### Erreur : "Client ID not found"

Vérifiez que vous avez bien ajouté les variables dans :
1. Le fichier `.env` (pour l'app frontend)
2. Supabase Edge Functions secrets (pour la backend)

### Les variables ne sont pas prises en compte

Redémarrez le dev server :
```bash
npm run dev
```

---

## 📝 Résumé en 30 secondes

1. **Google Console** : Changez redirect URI vers `http://localhost:5173/oauth/callback`
2. **`.env`** : Ajoutez `VITE_GOOGLE_CLIENT_ID` et `VITE_GOOGLE_CLIENT_SECRET`
3. **Supabase Secrets** : Ajoutez `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
4. Redémarrez : `npm run dev`
5. Testez : http://localhost:5173
