# 🔍 OAuth Debug Checklist - Unable to exchange external code

## ❌ Erreur actuelle
```
Unable to exchange external code: 4/0AVGzR1BQVpxbesJEmf0xvInMZC7VXjmDO2Kn8tMqj02PrUTgE2Yh6y3DDPM7ohpowJvPhg
```

Cette erreur signifie que **Supabase ne peut pas échanger le code avec Google**.

## 🎯 SOLUTION : Vérification point par point

### ÉTAPE 1 : Google Cloud Console - Obtenir les identifiants

1. Allez sur : https://console.cloud.google.com/apis/credentials
2. **Sélectionnez le BON projet** (vérifiez en haut de la page)
3. Trouvez votre **OAuth 2.0 Client ID** dans la liste
4. Cliquez dessus pour l'ouvrir

#### A. Vérifiez les Redirect URIs

Dans la section **"Authorized redirect URIs"**, vous DEVEZ avoir :

```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
http://localhost:5173/
https://starlinko.pro/
https://starlinko.pro
```

⚠️ **CRITIQUES** :
- Pas d'espaces avant/après
- Pas de slash à la fin pour le callback Supabase
- Slash obligatoire à la fin pour localhost et starlinko.pro
- Protocole HTTPS pour supabase.co (pas HTTP)

Si ce n'est pas exactement ça : **CORRIGEZ et SAVE**

#### B. Copiez vos identifiants

**Client ID** :
- Format : `123456789-abc123def456.apps.googleusercontent.com`
- ❗ Copiez-le ENTIÈREMENT (ne tronquez pas)

**Client Secret** :
- Format : `GOCSPX-abcdefghijklmnopqrstuvwxyz1234`
- ❗ Copiez-le ENTIÈREMENT (très important !)

**GARDEZ cette page ouverte pour l'étape 2**

---

### ÉTAPE 2 : Supabase Dashboard - Configuration OAuth

1. Allez sur : https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/auth/providers

2. Trouvez **Google** dans la liste

3. Cliquez dessus pour l'éditer

#### A. Vérifiez que c'est activé

Le toggle **"Enable Sign in with Google"** doit être **ON** (vert)

Si pas activé : Activez-le MAINTENANT

#### B. Collez vos identifiants EXACTEMENT

**Client ID (for OAuth)** :
- Collez EXACTEMENT le Client ID de l'étape 1B
- Vérifiez qu'il n'y a pas d'espaces avant/après
- Vérifiez qu'il se termine par `.apps.googleusercontent.com`

**Client Secret (for OAuth)** :
- Collez EXACTEMENT le Client Secret de l'étape 1B
- Vérifiez qu'il n'y a pas d'espaces avant/après
- Vérifiez qu'il commence par `GOCSPX-`

#### C. Authorized Client IDs

**Laissez ce champ VIDE** (n'y touchez pas)

#### D. Skip nonce check

**Décochez cette case** (doit être OFF)

#### E. Additional Scopes

**Laissez VIDE pour le moment** (on testera d'abord sans business.manage)

#### F. SAVE

Cliquez sur **"Save"** en bas de la page

---

### ÉTAPE 3 : OAuth Consent Screen

1. Allez sur : https://console.cloud.google.com/apis/credentials/consent

2. Vérifiez le **Publishing status** :

#### Si "Testing" :

**Authorized test users** - Ajoutez votre email Gmail :
```
votre-email@gmail.com
```

Cliquez **SAVE**

#### Si "In production" :

Parfait, passez à l'étape 4

#### Si "Not configured" :

1. Cliquez **"Configure Consent Screen"**
2. Choisissez **"External"**
3. Remplissez les champs obligatoires :
   - App name : `Starlinko`
   - User support email : votre email
   - Developer contact : votre email
4. **SAVE AND CONTINUE**
5. Dans "Scopes" : Cliquez juste **SAVE AND CONTINUE** (on ajoutera plus tard)
6. Dans "Test users" : Ajoutez votre email Gmail
7. **SAVE AND CONTINUE**

---

### ÉTAPE 4 : Test

⏰ **ATTENDEZ 5 MINUTES** (propagation Google)

1. **Fermez tous les onglets** de votre navigateur
2. **Ouvrez un nouvel onglet en mode incognito**
3. Allez sur : `http://localhost:5173`
4. Ouvrez la **Console du navigateur** (F12)
5. Allez dans l'onglet **Console**
6. Cliquez sur **"Se connecter avec Google"**
7. **Regardez les logs dans la console**

#### Si ça fonctionne : ✅

Vous devriez voir l'écran de consentement Google, puis être redirigé vers l'app.

#### Si même erreur : ❌

**Dans la console du navigateur**, cherchez :
```
🚀 Initiating Supabase OAuth...
```

Puis regardez s'il y a des erreurs après.

---

### ÉTAPE 5 : Vérifications supplémentaires si ça ne marche pas

#### A. Client ID/Secret - Double vérification

Retournez sur :
- https://console.cloud.google.com/apis/credentials
- https://supabase.com/dashboard/project/0ec90b57d6e95fcbda19832f/auth/providers

**Comparez caractère par caractère** :
- Le Client ID dans Google = Client ID dans Supabase ?
- Le Client Secret dans Google = Client Secret dans Supabase ?

⚠️ **Une seule lettre différente = erreur "Unable to exchange"**

#### B. Redirect URI - Vérification exacte

Dans Google Cloud Console, les URIs doivent être EXACTEMENT :

```
https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
```

Vérifiez :
- ✅ `https://` (pas `http://`)
- ✅ `0ec90b57d6e95fcbda19832f` (votre project ID)
- ✅ `.supabase.co` (pas `.supabase.com`)
- ✅ `/auth/v1/callback` (pas `/auth/callback`)
- ✅ Pas de `/` à la fin

#### C. Le bon projet Google ?

Dans Google Cloud Console, vérifiez en haut de la page que vous êtes sur le **bon projet**.

Si vous avez plusieurs projets Google Cloud, vous êtes peut-être sur le mauvais.

#### D. APIs activées ?

Allez sur : https://console.cloud.google.com/apis/library

Recherchez et vérifiez que ces APIs sont activées :
- ✅ **Google+ API** (ou People API)
- ✅ **Google Identity Toolkit API**

Si pas activées : Activez-les et **attendez 10 minutes**

---

## 🆘 Si RIEN ne fonctionne

### Option A : Recréer les identifiants OAuth

1. Dans Google Cloud Console > Credentials
2. **Supprimez** l'ancien OAuth 2.0 Client ID
3. Cliquez **"CREATE CREDENTIALS" > "OAuth client ID"**
4. Application type : **"Web application"**
5. Name : `Starlinko Web Client`
6. Authorized redirect URIs :
   ```
   https://0ec90b57d6e95fcbda19832f.supabase.co/auth/v1/callback
   http://localhost:5173/
   ```
7. **CREATE**
8. Copiez le nouveau Client ID et Secret
9. Collez-les dans Supabase Dashboard
10. **Attendez 10 minutes**
11. Testez

### Option B : Tester avec un autre provider

Pour confirmer que Supabase OAuth fonctionne, testez avec GitHub (plus simple) :

1. Supabase Dashboard > Auth > Providers > **GitHub**
2. Activez-le
3. Suivez les instructions pour créer une OAuth App GitHub
4. Testez la connexion GitHub

Si GitHub fonctionne mais pas Google → Problème de config Google
Si GitHub ne fonctionne pas non plus → Problème Supabase

---

## 📝 Notes importantes

1. **Propagation des configs Google** : 5-15 minutes
2. **Cache navigateur** : Toujours tester en mode incognito
3. **Test users** : Si en mode "Testing", ajoutez votre email Gmail
4. **Client Secret** : Peut être régénéré si vous l'avez perdu
5. **Redirect URIs** : Sensible à la casse et aux slashes

## 🎯 Résumé en 30 secondes

1. Google Cloud Console > Credentials > Copiez Client ID et Secret
2. Supabase Dashboard > Auth > Providers > Google > Collez Client ID et Secret
3. Google Cloud Console > Credentials > Vérifiez les 4 Redirect URIs
4. Attendez 5 minutes
5. Testez en mode incognito

**Un seul caractère différent dans le Client Secret = erreur "Unable to exchange"**
