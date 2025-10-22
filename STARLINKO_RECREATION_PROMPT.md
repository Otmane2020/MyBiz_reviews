# Prompt Complet pour Recréer Starlinko - Plateforme de Gestion d'Avis Google My Business

## Vue d'ensemble du projet

Créer une plateforme SaaS moderne appelée "Starlinko" pour gérer automatiquement les avis Google My Business avec l'intelligence artificielle. La plateforme doit être responsive, sécurisée et offrir une expérience utilisateur premium.

## Stack Technique

### Frontend
- **Framework** : React 18 avec TypeScript
- **Build Tool** : Vite
- **Styling** : Tailwind CSS
- **Icons** : Lucide React
- **State Management** : React Hooks (useState, useEffect, useContext)
- **Routing** : Navigation par état (single page app)

### Backend & Base de données
- **Backend-as-a-Service** : Supabase
- **Base de données** : PostgreSQL (via Supabase)
- **Authentification** : Supabase Auth avec Google OAuth
- **API** : Supabase REST API + Edge Functions
- **Real-time** : Supabase Realtime pour les notifications

### Services externes
- **IA** : DeepSeek API pour génération de réponses
- **Paiements** : Stripe avec webhooks
- **APIs Google** : 
  - Google My Business Account Management API
  - Google My Business Business Information API
  - Google OAuth 2.0

### Déploiement
- **Hosting** : Bolt Hosting ou Netlify
- **Edge Functions** : Supabase Edge Functions (Deno)
- **Variables d'environnement** : Configuration sécurisée

## Architecture de la base de données

### Tables principales

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  level integer DEFAULT 1,
  total_points integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text DEFAULT 'trial',
  plan_id text DEFAULT 'starter',
  billing_cycle text DEFAULT 'monthly',
  trial_end timestamptz,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des avis Google My Business
CREATE TABLE reviews (
  id bigserial PRIMARY KEY,
  review_id text UNIQUE NOT NULL,
  location_id text NOT NULL,
  author text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text DEFAULT '',
  review_date timestamptz NOT NULL,
  replied boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des sessions Stripe (pour tracking)
CREATE TABLE stripe_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text,
  billing_cycle text,
  price_id text,
  status text DEFAULT 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des paramètres IA (optionnel, peut être stocké en localStorage)
CREATE TABLE ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  tone text DEFAULT 'friendly',
  response_length text DEFAULT 'M',
  include_signature boolean DEFAULT true,
  signature text DEFAULT 'L''équipe {business_name}',
  custom_template text DEFAULT '',
  auto_reply_delay integer DEFAULT 5,
  only_positive_reviews boolean DEFAULT false,
  minimum_rating integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### Indexes et sécurité RLS

```sql
-- Indexes pour performance
CREATE INDEX idx_reviews_location_id ON reviews(location_id);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies RLS
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated users can read all reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update reviews" ON reviews FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Users can manage own AI settings" ON ai_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
```

## Structure des composants React

### Composants principaux

```
src/
├── App.tsx                           # Composant racine avec routing
├── main.tsx                          # Point d'entrée
├── index.css                         # Styles Tailwind
├── lib/
│   └── supabase.ts                   # Configuration Supabase
├── hooks/
│   ├── useStripe.ts                  # Hook pour Stripe
│   ├── useChatGPT.ts                 # Hook pour DeepSeek AI
│   ├── useReviewsNotifications.ts    # Hook pour notifications temps réel
├── components/
│   ├── StarlinkoLogo.tsx             # Logo avec dégradé Google
│   ├── AuthPage.tsx                  # Page d'authentification
│   ├── LandingPage.tsx               # Page d'accueil marketing
│   ├── Dashboard.tsx                 # Tableau de bord principal
│   ├── MobileMenu.tsx                # Menu mobile responsive
│   ├── GoogleBusinessSetup.tsx       # Configuration Google My Business
│   ├── ComprehensiveOnboarding.tsx   # Onboarding complet
│   ├── SettingsPage.tsx              # Page paramètres avec plans
│   ├── AISettingsPage.tsx            # Configuration IA DeepSeek
│   ├── NotificationCenter.tsx        # Centre de notifications
│   ├── NotificationToast.tsx         # Toast notifications
│   └── StripeSetup.tsx               # Configuration Stripe
├── pages/
│   ├── GoogleReviews.tsx             # Gestion des avis
│   ├── GoogleMyBusinessPage.tsx      # Statistiques GMB
│   ├── SuccessPage.tsx               # Page succès paiement
│   └── SuperAdmin.tsx                # Panel super admin
```

## Fonctions Supabase Edge

### Structure des Edge Functions

```
supabase/functions/
├── google-oauth/
│   └── index.ts                      # Proxy Google APIs
├── chatgpt-api/
│   └── index.ts                      # Intégration DeepSeek AI
├── fetch-reviews/
│   └── index.ts                      # Récupération avis GMB
├── stripe-checkout/
│   └── index.ts                      # Création sessions Stripe
├── stripe-webhook/
│   └── index.ts                      # Webhooks Stripe
└── stripe-products/
    └── index.ts                      # Gestion produits Stripe
```

## Fonctionnalités détaillées

### 1. Authentification et onboarding

**Authentification** :
- Google OAuth via Supabase Auth
- Authentification email/mot de passe en fallback
- Gestion automatique des sessions
- Tokens refresh automatique

**Onboarding** :
- Étapes : Bienvenue → Connexion GMB → Sélection plan → Fonctionnalités → Complet
- Sélection des établissements Google My Business
- Choix du plan avec essai gratuit 14 jours
- Configuration initiale des paramètres IA

### 2. Gestion des avis Google My Business

**Synchronisation** :
- Récupération automatique des avis via Google My Business API
- Stockage en base Supabase avec dédoublonnage
- Notifications temps réel pour nouveaux avis
- Historique complet des avis

**Réponses IA** :
- Génération automatique via DeepSeek API
- 4 tons : Professionnel, Amical, Humoristique, Chaleureux
- 3 longueurs : Court (S), Moyen (M), Long (L)
- Templates personnalisables
- Signatures automatiques
- Délai configurable avant réponse

### 3. Tableau de bord et analytics

**Dashboard principal** :
- Statistiques : Avis totaux, note moyenne, taux de réponse
- Graphiques de tendances
- Avis récents avec statut de réponse
- Actions rapides

**Google My Business Analytics** :
- Vues du profil, recherches, actions clients
- Appels téléphoniques, demandes d'itinéraire
- Clics site web, vues des photos
- Tendances et performance globale

### 4. Système de paiement Stripe

**Plans tarifaires** :
- **Starter** : 9,90€/mois - 1 établissement, 50 avis/mois, IA basique
- **Pro** : 29,90€/mois - 3 établissements, 300 avis/mois, IA premium
- **Business** : 79,90€/mois - Illimité, 1000 avis/mois, IA premium + posts auto

**Fonctionnalités Stripe** :
- Essai gratuit 14 jours pour tous les plans
- Facturation mensuelle/annuelle (-20% sur annuel)
- Pay-as-you-go : 0,10€ par réponse supplémentaire
- Webhooks pour gestion automatique des abonnements
- Gestion des échecs de paiement

### 5. Notifications temps réel

**Types de notifications** :
- Nouveaux avis reçus
- Réponses IA envoyées
- Fin d'essai gratuit
- Échecs de paiement

**Canaux** :
- Notifications navigateur
- Centre de notifications in-app
- Toast notifications
- Emails (via Supabase)

### 6. Panel Super Admin

**Fonctionnalités admin** :
- Vue d'ensemble : utilisateurs, revenus, avis traités
- Gestion des utilisateurs : voir, modifier, supprimer
- Gestion des abonnements Stripe
- Analytics avancées
- Configuration système
- Logs et sécurité

## Variables d'environnement

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### Supabase Edge Functions
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_API_KEY=your-google-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
```

## Configuration Google Cloud

### APIs à activer
1. Google My Business Account Management API
2. Google My Business Business Information API
3. Google OAuth 2.0

### OAuth 2.0 Configuration
- **Type** : Application Web
- **Origines autorisées** : https://your-domain.com
- **URI de redirection** : https://your-domain.com
- **Scopes** : 
  - `https://www.googleapis.com/auth/business.manage`
  - `https://www.googleapis.com/auth/userinfo.profile`
  - `https://www.googleapis.com/auth/userinfo.email`

## Design System

### Couleurs Google
- **Bleu Google** : #4285F4
- **Vert Google** : #34A853
- **Jaune Google** : #FBBC05
- **Rouge Google** : #EA4335

### Typographie
- **Font** : System fonts (sans-serif)
- **Tailles** : text-sm, text-base, text-lg, text-xl, text-2xl
- **Poids** : font-medium, font-semibold, font-bold

### Composants UI
- **Boutons** : Arrondis (rounded-lg), dégradés, états hover/focus
- **Cards** : Ombres subtiles, bordures arrondies
- **Inputs** : Focus ring bleu Google, validation visuelle
- **Notifications** : Toast avec animations, centre de notifications

## Sécurité

### Authentification
- Google OAuth 2.0 sécurisé
- Tokens JWT via Supabase
- Refresh automatique des tokens
- Sessions sécurisées

### Base de données
- Row Level Security (RLS) activé
- Policies restrictives par utilisateur
- Chiffrement des données sensibles
- Backup automatique

### API
- CORS configuré correctement
- Rate limiting sur Edge Functions
- Validation des inputs
- Logs de sécurité

## Déploiement

### Étapes de déploiement
1. **Supabase** : Créer projet, configurer base de données, déployer Edge Functions
2. **Google Cloud** : Configurer OAuth, activer APIs, obtenir clés
3. **Stripe** : Configurer produits, webhooks, clés API
4. **DeepSeek** : Obtenir clé API
5. **Frontend** : Configurer variables d'environnement, build, déployer

### Monitoring
- Logs Supabase pour Edge Functions
- Analytics Stripe pour paiements
- Monitoring Google APIs quotas
- Alertes sur erreurs critiques

## Tests et qualité

### Tests recommandés
- Tests unitaires pour hooks React
- Tests d'intégration pour Edge Functions
- Tests E2E pour parcours utilisateur critiques
- Tests de charge pour APIs

### Qualité code
- TypeScript strict mode
- ESLint + Prettier
- Validation des props React
- Documentation des fonctions complexes

## Maintenance et évolution

### Monitoring continu
- Surveillance des quotas Google APIs
- Monitoring des performances Supabase
- Alertes sur échecs de paiement Stripe
- Logs d'erreurs centralisés

### Évolutions possibles
- Application mobile React Native
- Intégration d'autres plateformes d'avis
- IA plus avancée (GPT-4, Claude)
- Rapports PDF automatiques
- API publique pour intégrations

---

## Prompt de création complet

Utilisez ce prompt pour recréer la plateforme :

"Crée une plateforme SaaS moderne appelée Starlinko pour gérer automatiquement les avis Google My Business avec l'IA. 

Stack technique : React 18 + TypeScript + Vite + Tailwind CSS + Supabase + Stripe + DeepSeek AI + Google My Business APIs.

Fonctionnalités principales :
1. Authentification Google OAuth via Supabase
2. Onboarding complet avec sélection d'établissements GMB
3. Synchronisation automatique des avis Google My Business
4. Génération de réponses IA personnalisées avec DeepSeek
5. 3 plans tarifaires avec essai gratuit 14 jours
6. Tableau de bord avec analytics GMB
7. Notifications temps réel
8. Panel super admin
9. Design responsive avec couleurs Google

Base de données : Tables profiles, reviews, stripe_sessions, ai_settings avec RLS.
Edge Functions : google-oauth, chatgpt-api, fetch-reviews, stripe-checkout, stripe-webhook.
Design : Interface premium style Apple avec micro-interactions et animations.

Implémente toute l'architecture décrite ci-dessus avec une attention particulière à la sécurité, l'UX et la performance."