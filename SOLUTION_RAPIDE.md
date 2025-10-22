# Solution Rapide - Erreur API Key Google Maps

## 🚨 Problème
Vous voyez cette erreur : **"API key invalide ou restrictions activées"**

## ✅ Solution en 3 étapes

### 1️⃣ Testez votre configuration
Allez sur **`/diagnostic`** dans votre application pour voir l'état de votre configuration.

### 2️⃣ Ajoutez le secret dans Supabase

**Option A : Via l'interface Supabase (Recommandé)**
1. Allez sur : https://supabase.com/dashboard/project/gadwucduwbpddvtdyokr/settings/vault/secrets
2. Cliquez sur **"New secret"**
3. Remplissez :
   - **Name** : `GOOGLE_MAPS_API_KEY`
   - **Value** : `AIzaSyD1s73rZidQJRF1TfRzpxRx6e_pTdFUEPc`
4. Cliquez sur **"Save"**

**Option B : Via Supabase CLI**
```bash
supabase secrets set GOOGLE_MAPS_API_KEY=AIzaSyD1s73rZidQJRF1TfRzpxRx6e_pTdFUEPc
```

### 3️⃣ Vérifiez dans Google Cloud Console

1. Allez sur : https://console.cloud.google.com/apis/credentials
2. Sélectionnez votre clé API
3. Vérifiez que **Places API** est activée
4. Dans les restrictions HTTP referrers, ajoutez :
   - `*.supabase.co/*`
   - `localhost:*` (pour le dev)
   - Votre domaine de production

## 🔍 Test

Après avoir configuré le secret :
1. Attendez 1-2 minutes (le temps que Supabase applique les changements)
2. Allez sur `/diagnostic` pour vérifier
3. Testez la recherche d'établissement dans "Mes établissements"

## 📋 Checklist rapide

- [ ] Secret `GOOGLE_MAPS_API_KEY` créé dans Supabase
- [ ] Places API activée dans Google Cloud Console
- [ ] Restrictions HTTP referrers configurées
- [ ] Test sur `/diagnostic` → Configuration OK
- [ ] Test de recherche d'établissement → Fonctionne

## ❓ Toujours des problèmes ?

1. Consultez la console du navigateur (F12) pour voir les erreurs détaillées
2. Vérifiez les logs de l'Edge Function dans Supabase
3. Consultez `GOOGLE_SETUP.md` pour le guide complet

## 🎯 Google My Business ne fonctionne pas ?

Si le bouton "Connecter Google My Business" ne fait rien :

1. Vérifiez que OAuth Google est activé dans Supabase Dashboard
2. Ajoutez l'URI de redirection : `https://gadwucduwbpddvtdyokr.supabase.co/auth/v1/callback`
3. Activez ces APIs dans Google Cloud Console :
   - Google My Business API
   - My Business Business Information API
   - My Business Account Management API

---

**Note** : Le fichier `.env` contient `VITE_GOOGLE_MAPS_API_KEY` mais cette variable n'est accessible que côté client. L'Edge Function a besoin du secret côté serveur configuré dans Supabase.
