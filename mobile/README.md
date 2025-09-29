# Starlinko Mobile

Application mobile React Native pour gérer les avis Google My Business.

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start

# Lancer sur Android
npm run android

# Lancer sur iOS
npm run ios
```

## 📱 Fonctionnalités

- ✅ **Authentification** avec Supabase
- ✅ **Dashboard** avec statistiques
- ✅ **Gestion des avis** Google My Business
- ✅ **Notifications push** pour nouveaux avis
- ✅ **Réponses IA** automatiques
- ✅ **Mode hors-ligne** avec synchronisation

## 🔧 Configuration

### 1. Variables d'environnement

Créer un fichier `.env` :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 2. Configuration Supabase

Le mobile utilise la **même base de données** que le web :
- ✅ Même tables (`reviews`, `profiles`, etc.)
- ✅ Même authentification
- ✅ Même API REST
- ✅ Real-time synchronisé

### 3. Build pour production

```bash
# Android
eas build --platform android

# iOS
eas build --platform ios

# Les deux
eas build --platform all
```

## 🔄 Synchronisation Web ↔ Mobile

### Données partagées :
- **Utilisateurs** : Même compte sur web et mobile
- **Avis** : Synchronisés en temps réel
- **Réponses** : Visibles partout
- **Paramètres IA** : Partagés entre plateformes

### Avantages :
- 📱 **Une seule base de données**
- 🔄 **Synchronisation automatique**
- 💰 **Coûts réduits**
- 🛠️ **Maintenance simplifiée**

## 📦 Publication

### Google Play Store :
```bash
eas build --platform android --profile production
eas submit --platform android
```

### Apple App Store :
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## 🎯 Architecture

```
Web (starlinko.pro)     Mobile App
       ↓                    ↓
   Supabase Database ← → Supabase Database
       ↓                    ↓
   Same tables          Same tables
   Same auth            Same auth
   Same API             Same API
```

**Résultat** : Une expérience unifiée sur tous les appareils ! 🎉