import React, { useState } from 'react';
import { Star, MessageSquare, Smartphone, TrendingUp, Users, Shield, Crown, Zap, Check, BadgeCheck } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // URL d'autorisation Google OAuth avec les scopes appropriés
  const getGoogleAuthUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/auth/v1/authorize?provider=google`;
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      subtitle: 'Découverte',
      monthlyPrice: '9,90€',
      annualPrice: '95,04€',
      period: '/mois',
      annualPeriod: '/an',
      description: 'Parfait pour débuter',
      features: [
        '1 établissement Google My Business',
        '50 avis/réponses automatiques par mois',
        'Réponses IA basiques (GPT-4)',
        'Alertes email sur nouveaux avis',
        'Tableau de bord basique',
        'Accès API Google My Business vérifié'
      ],
      icon: <Star className="w-6 h-6" />,
      color: 'from-[#4285F4] to-[#34A853]',
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      subtitle: 'Visibilité',
      monthlyPrice: '29,90€',
      annualPrice: '287,04€',
      period: '/mois',
      annualPeriod: '/an',
      description: 'Pour développer votre visibilité',
      features: [
        'Jusqu\'à 3 établissements Google My Business',
        '300 avis/réponses automatiques par mois',
        'Réponses IA premium (GPT-4.1)',
        'Notifications temps réel',
        'Statistiques avancées',
        'Support prioritaire',
        'API Google My Business complète'
      ],
      icon: <Crown className="w-6 h-6" />,
      color: 'from-[#FBBC05] to-[#EA4335]',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      subtitle: 'Performance',
      monthlyPrice: '79,90€',
      annualPrice: '767,04€',
      period: '/mois',
      annualPeriod: '/an',
      description: 'Solution complète pour entreprises',
      features: [
        'Établissements Google My Business illimités',
        '1000 avis/réponses automatiques par mois',
        'IA premium + posts automatiques',
        'API & webhooks avancés',
        'Manager dédié',
        'Rapports personnalisés',
        'Accès API Business Profile complet'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'from-[#EA4335] to-[#4285F4]',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05]">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <StarlinkoLogo size="md" showGoogleIcon={true} className="text-white" />
              <div className="ml-2 flex items-center bg-white/20 rounded-full px-3 py-1">
                <BadgeCheck className="w-4 h-4 text-white mr-1" />
                <span className="text-white text-sm font-medium">API vérifiée</span>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Fonctionnalités
              </button>
              <button
                onClick={() => scrollToSection('compliance')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Conformité
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection('api-access')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Accès API
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="hidden md:block bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                Se connecter
              </button>
              <a
                href={getGoogleAuthUrl()}
                className="bg-white text-[#4285F4] px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Commencer
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-20 pb-16 px-4 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center">
              <Shield className="w-5 h-5 text-white mr-2" />
              <span className="text-white text-sm font-medium">
                Application vérifiée Google API • Conforme aux politiques
              </span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connectez vos avis Google My Business
            <span className="block text-[#FBBC05]">avec accès API vérifié</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Starlinko est une application vérifiée avec accès complet à l'API Google My Business. 
            Gérez et répondez automatiquement à vos avis en toute conformité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href={getGoogleAuthUrl()}
              className="bg-white text-[#4285F4] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg flex items-center"
            >
              <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              S'authentifier avec Google
            </a>
            <div className="text-white/80 text-sm text-center">
              ✅ Application vérifiée • 🔒 Conforme aux politiques Google • 🚀 14 jours d'essai gratuit
            </div>
          </div>
        </div>
      </section>

      {/* API Access Section */}
      <section id="api-access" className="py-16 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Accès API Google My Business vérifié
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Starlinko dispose d'un accès vérifié à l'API Google My Business, garantissant 
              une intégration sécurisée et conforme aux politiques de Google.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <BadgeCheck className="w-8 h-8 text-[#34A853] mr-3" />
                  <h3 className="text-xl font-semibold text-white">Application vérifiée</h3>
                </div>
                <p className="text-white/80">
                  Notre application a été examinée et approuvée par Google pour l'accès à l'API 
                  Google My Business, garantissant sécurité et conformité.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Shield className="w-8 h-8 text-[#4285F4] mr-3" />
                  <h3 className="text-xl font-semibold text-white">Données sécurisées</h3>
                </div>
                <p className="text-white/80">
                  Conformité OAuth 2.0 avec des scopes d'accès limités. Vos données sont 
                  chiffrées et protégées selon les standards de l'industrie.
                </p>
              </div>

              <div className="bg-white/10 rounded-xl p-6 border border-white/20">
                <div className="flex items-center mb-4">
                  <Zap className="w-8 h-8 text-[#FBBC05] mr-3" />
                  <h3 className="text-xl font-semibold text-white">Intégration native</h3>
                </div>
                <p className="text-white/80">
                  Accès direct à l'API Business Profile de Google pour une synchronisation 
                  en temps réel et des fonctionnalités complètes.
                </p>
              </div>
            </div>

            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">
                Scopes d'accès API
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-[#34A853] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Lecture des avis</span>
                    <p className="text-white/70 text-sm">Accès en lecture seule à vos avis Google</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-[#34A853] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Réponse aux avis</span>
                    <p className="text-white/70 text-sm">Publication de réponses aux avis clients</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-[#34A853] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Gestion du profil</span>
                    <p className="text-white/70 text-sm">Accès aux informations de votre établissement</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Check className="w-5 h-5 text-[#34A853] mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-white font-medium">Métriques business</span>
                    <p className="text-white/70 text-sm">Accès aux statistiques de performance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Compliance Section */}
      <section id="compliance" className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Conformité et Sécurité
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="bg-[#4285F4] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Politiques Google</h3>
              <p className="text-white/80">
                Respect strict des politiques d'utilisation de l'API Google My Business et 
                des directives de la plateforme.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="bg-[#34A853] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Vérification OAuth</h3>
              <p className="text-white/80">
                Application vérifiée avec processus d'authentification OAuth 2.0 sécurisé 
                et scopes appropriés.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6 text-center">
              <div className="bg-[#FBBC05] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Transparence</h3>
              <p className="text-white/80">
                Accès clair et limité aux données. Vous contrôlez entièrement les 
                autorisations accordées.
              </p>
            </div>
          </div>

          {/* Additional Compliance Info */}
          <div className="mt-12 bg-white/5 rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Notre engagement de conformité
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">✅ Ce que nous faisons</h4>
                <ul className="space-y-2 text-white/80">
                  <li>• Application vérifiée par Google</li>
                  <li>• Respect des quotas API</li>
                  <li>• Sécurité des données OAuth 2.0</li>
                  <li>• Conformité aux politiques de contenu</li>
                  <li>• Transparence des données</li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">🚫 Ce que nous ne faisons pas</h4>
                <ul className="space-y-2 text-white/80">
                  <li>• Stockage inutile de données</li>
                  <li>• Partage avec des tiers</li>
                  <li>• Utilisation abusive de l'API</li>
                  <li>• Contournement des limites</li>
                  <li>• Non-respect des politiques</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white/5 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Fonctionnalités avec API vérifiée
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <MessageSquare className="w-8 h-8 text-[#34A853] mr-3" />
                <h3 className="text-xl font-semibold text-white">Réponses IA vérifiées</h3>
              </div>
              <p className="text-white/80">
                Réponses automatiques générées par IA avec modération automatique pour 
                respecter les politiques de contenu Google.
              </p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="w-8 h-8 text-[#FBBC05] mr-3" />
                <h3 className="text-xl font-semibold text-white">Analytics conformes</h3>
              </div>
              <p className="text-white/80">
                Tableaux de bord et analyses respectant les conditions d'utilisation de 
                l'API Google My Business.
              </p>
            </div>
          </div>

          {/* API Status */}
          <div className="bg-white/10 rounded-2xl p-6 border border-[#34A853]/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-[#34A853] rounded-full mr-3 animate-pulse"></div>
                <span className="text-white font-semibold">Statut API Google My Business</span>
              </div>
              <span className="text-[#34A853] font-medium">● Opérationnel</span>
            </div>
            <p className="text-white/70 text-sm mt-2">
              L'accès à l'API Google My Business est actif et vérifié. Toutes les fonctionnalités 
              sont disponibles conformément aux politiques de la plateforme.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Tarifs avec accès API vérifié
            </h2>
            <p className="text-xl text-white/90 mb-8">
              ✅ Application vérifiée Google • 🔒 Conforme aux politiques • 🚀 14 jours d'essai gratuit
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-white/20 backdrop-blur-md rounded-full p-1 flex">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-[#4285F4] shadow-lg'
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  Mensuel
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all relative ${
                    billingCycle === 'annual'
                      ? 'bg-white text-[#4285F4] shadow-lg'
                      : 'text-white hover:text-white/80'
                  }`}
                >
                  Annuel
                  <span className="absolute -top-2 -right-2 bg-[#34A853] text-white text-xs px-2 py-0.5 rounded-full">
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 ${
                  plan.popular ? 'ring-4 ring-[#FBBC05]' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-gradient-to-r from-[#FBBC05] to-[#EA4335] text-white text-center py-2 font-semibold text-sm">
                    ⭐ Plus populaire
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`bg-gradient-to-r ${plan.color} p-3 rounded-xl text-white`}>
                      {plan.icon}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.subtitle}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">
                        {billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {billingCycle === 'monthly' ? plan.period : plan.annualPeriod}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <p className="text-sm text-[#34A853] font-medium mt-1">
                        Économisez 20% par an
                      </p>
                    )}
                  </div>

                  {/* API Access Badge */}
                  <div className="bg-[#34A853]/10 border border-[#34A853]/30 rounded-lg p-3 mb-4">
                    <div className="flex items-center">
                      <BadgeCheck className="w-4 h-4 text-[#34A853] mr-2" />
                      <span className="text-[#34A853] text-sm font-medium">
                        Accès API Google vérifié
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={getGoogleAuthUrl()}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#FBBC05] to-[#EA4335] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    </svg>
                    Essayer gratuitement
                  </a>

                  {/* Features List */}
                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-[#34A853] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Footer */}
          <div className="text-center mt-12">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                🛡️ Conformité et Sécurité
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-white/80">
                <div>✅ Application vérifiée Google</div>
                <div>🔒 Données chiffrées OAuth 2.0</div>
                <div>📋 Conforme aux politiques API</div>
                <div>🚀 Accès API Business Profile</div>
                <div>⚡ Synchronisation temps réel</div>
                <div>🎯 Scopes d'accès limités</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center px-4">
          <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à connecter vos avis avec une API vérifiée ?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Rejoignez des centaines d'entreprises qui utilisent Starlinko en toute confiance 
              avec notre accès API Google My Business vérifié.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href={getGoogleAuthUrl()}
                className="bg-[#EA4335] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d33b2c] transition-all transform hover:scale-105 shadow-lg flex items-center"
              >
                <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
                S'authentifier avec Google
              </a>
              <div className="text-white/80 text-sm text-center">
                🔐 Application vérifiée • ✅ Conforme aux politiques • 🚀 14 jours gratuits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarlinkoLogo size="md" showText={true} className="text-white" />
            <div className="ml-4 bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">API Google vérifiée</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 justify-center mb-6">
            <a href="/privacy" className="text-white/80 hover:text-white transition-colors text-sm">
              Confidentialité
            </a>
            <a href="/terms" className="text-white/80 hover:text-white transition-colors text-sm">
              Conditions d'utilisation
            </a>
            <a href="/api-terms" className="text-white/80 hover:text-white transition-colors text-sm">
              Conditions API
            </a>
            <a href="/gdpr" className="text-white/80 hover:text-white transition-colors text-sm">
              RGPD
            </a>
          </div>

          <div className="border-t border-white/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm mb-4 md:mb-0">
                © 2024 Starlinko. Application vérifiée avec accès API Google My Business.
                Tous droits réservés.
              </p>
              
              <div className="flex space-x-4">
                <a href="https://twitter.com/starlinko" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/starlinko" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;