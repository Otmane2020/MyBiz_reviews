# 🚨 SOLUTION IMMÉDIATE - Erreur OAuth

## Le problème
```
Unable to exchange external code
```

**Cause** : Les URIs de redirection ne sont pas configurées dans Google Cloud Console.

## ✅ LA SOLUTION (5 minutes)

### 1️⃣ Google Cloud Console

Allez ici : https://console.cloud.google.com/apis/credentials

1. Cliquez sur votre **OAuth 2.0 Client ID**
2. Section **"Authorized redirect URIs"**
3. Ajoutez **CES 4 LIGNES EXACTEMENT** :

```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
http://localhost:5173/
https://starlinko.pro/
https://starlinko.pro
```

4. **SAVE** en bas de page
5. **Attendez 2 minutes** (propagation Google)

### 2️⃣ Supabase Dashboard

Allez ici : https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/auth/providers

1. Trouvez **Google** dans la liste
2. Cliquez dessus pour l'éditer
3. Vérifiez que c'est activé (toggle ON)
4. Dans **"Additional Scopes"**, ajoutez :

```
https://www.googleapis.com/auth/business.manage
```

5. **Save**

### 3️⃣ Test

1. **Ouvrez un onglet en mode incognito**
2. Allez sur `http://localhost:5173`
3. Cliquez sur "Se connecter avec Google"
4. ✅ Ça devrait marcher !

## ⚠️ Si ça ne marche TOUJOURS pas

### Vérification A : Client ID et Secret

Dans Google Cloud Console, copiez :
- **Client ID** (ressemble à : `123456-abc.apps.googleusercontent.com`)
- **Client Secret** (ressemble à : `GOCSPX-abcdefg`)

Dans Supabase Dashboard (même lien que ci-dessus), collez exactement les mêmes valeurs.

### Vérification B : OAuth Consent Screen

Google Cloud Console > OAuth consent screen

1. **Publishing status** doit être "In production" (ou "Testing")
2. **Authorized domains** : Ajoutez `starlinko.pro` et `supabase.co`
3. **Scopes** : Ajoutez `.../auth/business.manage` si absent

### Vérification C : APIs activées

Google Cloud Console > APIs & Services > Library

Activez ces 3 APIs :
1. ✅ My Business Account Management API
2. ✅ My Business Business Information API
3. ✅ My Business Verifications API

**IMPORTANT** : Attendez 10 minutes après activation !

## 🎯 Checklist rapide

Cochez chaque point :

- [ ] 4 Redirect URIs ajoutées dans Google Cloud Console
- [ ] Sauvegardé et attendu 2 minutes
- [ ] Scope `business.manage` ajouté dans Supabase
- [ ] Client ID et Secret identiques dans Google et Supabase
- [ ] Testé en mode incognito
- [ ] Cache navigateur vidé

## 💬 Message d'erreur précis

Si vous voyez une autre erreur, lisez-la attentivement :

| Erreur | Solution |
|--------|----------|
| `redirect_uri_mismatch` | URIs mal configurées → Vérifiez étape 1 |
| `invalid_client` | Client ID/Secret incorrect → Vérifiez étape 2 |
| `access_denied` | Utilisateur a refusé OU consent screen mal configuré |
| `insufficient_scope` | Scope `business.manage` manquant → Vérifiez étape 2 |

## 📞 Toujours bloqué ?

1. Faites une capture d'écran de l'URL d'erreur complète
2. Vérifiez les logs : https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/logs/auth-logs
3. Attendez 15 minutes si vous venez de modifier les configs Google
4. Testez avec un compte Gmail différent
