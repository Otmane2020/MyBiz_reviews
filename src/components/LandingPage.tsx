import React, { useState } from 'react';
import { Star, MessageSquare, Smartphone, TrendingUp, Users, Shield, Crown, Zap, Check } from 'lucide-react';
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
        '1 établissement Google',
        '50 avis/réponses automatiques par mois',
        'Réponses IA basiques',
        'Alertes email sur nouveaux avis',
        'Tableau de bord basique'
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
        'Jusqu\'à 3 établissements',
        '300 avis/réponses automatiques par mois',
        'Réponses IA premium',
        'Notifications temps réel',
        'Statistiques avancées',
        'Support prioritaire'
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
        'Établissements illimités',
        '1000 avis/réponses automatiques par mois',
        'IA premium + posts automatiques',
        'API & webhooks',
        'Manager dédié',
        'Rapports personnalisés'
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
                onClick={() => scrollToSection('pricing')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                Tarifs
              </button>
              <button
                onClick={() => scrollToSection('stats')}
                className="text-white/90 hover:text-white transition-colors font-medium"
              >
                À propos
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={onGetStarted}
                className="hidden md:block bg-white/20 text-white px-4 py-2 rounded-full font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                Se connecter
              </button>
              <button
                onClick={onGetStarted}
                className="bg-white text-[#4285F4] px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors"
              >
                Commencer
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="pt-20 pb-16 px-4 min-h-screen flex items-center">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connectez vos avis Google
            <span className="block text-[#FBBC05]">en un clic</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Starlinko vous aide à gérer et répondre automatiquement à vos avis Google My Business avec l'IA. 
            Boostez votre réputation en ligne facilement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-[#4285F4] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
            >
              Essayer gratuitement
            </button>
            <div className="text-white/80 text-sm">
              ✨ 14 jours d'essai gratuit • Aucune carte requise
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pourquoi choisir Starlinko ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Réponses IA</h3>
              <p className="text-white/80">
                Répondez automatiquement avec des messages personnalisés générés par l'IA
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile First</h3>
              <p className="text-white/80">
                Interface optimisée pour mobile, gérez vos avis partout
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
              <p className="text-white/80">
                Suivez vos performances et l'évolution de votre réputation
              </p>
            </div>
          </div>
          
          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-[#34A853] mr-3" />
                <h3 className="text-xl font-semibold text-white">Sécurisé & Fiable</h3>
              </div>
              <p className="text-white/80">
                Connexion sécurisée avec Google OAuth 2.0. Vos données sont protégées et chiffrées.
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-6">
              <div className="flex items-center mb-4">
                <Users className="w-8 h-8 text-[#FBBC05] mr-3" />
                <h3 className="text-xl font-semibold text-white">Support Expert</h3>
              </div>
              <p className="text-white/80">
                Équipe support dédiée pour vous accompagner dans l'optimisation de votre réputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Choisissez votre plan
            </h2>
            <p className="text-xl text-white/90 mb-8">
              14 jours d'essai gratuit • Sans engagement • Résiliable à tout moment
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

                  {/* Description */}
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* CTA Button */}
                  <button
                    onClick={onGetStarted}
                    className={`w-full py-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#FBBC05] to-[#EA4335] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Essayer gratuitement
                  </button>

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

          {/* Additional Info */}
          <div className="text-center mt-12">
            <p className="text-white/90 text-sm">
              💳 Tous les plans incluent : Paiement sécurisé • Support client • Mises à jour gratuites
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Ils nous font confiance
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">10k+</div>
              <div className="text-white/80">Avis traités</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-white/80">Entreprises</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à connecter vos avis ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des centaines d'entreprises qui font confiance à Starlinko
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-[#EA4335] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d33b2c] transition-all transform hover:scale-105 shadow-lg"
            >
              Commencer maintenant
            </button>
            <div className="text-white/80 text-sm">
              🚀 Configuration en 2 minutes
            </div>
          </div>
        </div>
      </section>
      

      {/* Footer uniquement */}
      <footer className="bg-black/30 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-6">
            <StarlinkoLogo size="md" showText={true} className="text-white" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 justify-center">
            <a href="/privacy" className="text-white/80 hover:text-white transition-colors text-sm">
              Confidentialité
            </a>
            <a href="/terms" className="text-white/80 hover:text-white transition-colors text-sm">
              Conditions d'utilisation
            </a>
            <a href="/cookies" className="text-white/80 hover:text-white transition-colors text-sm">
              Politique des cookies
            </a>
            <a href="/gdpr" className="text-white/80 hover:text-white transition-colors text-sm">
              RGPD
            </a>
          </div>

               
          {/* Séparateur */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/60 text-sm mb-4 md:mb-0">
                © 2024 Starlinko. Tous droits réservés. Gérez vos avis Google My Business avec l'IA.
              </p>
              
              {/* Réseaux sociaux */}
              <div className="flex space-x-4">
                <a href="https://twitter.com/starlinko" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com/company/starlinko" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://facebook.com/starlinko" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
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