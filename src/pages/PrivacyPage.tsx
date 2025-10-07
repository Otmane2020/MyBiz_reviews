import React from 'react';
import { Star, MessageSquare, Smartphone, TrendingUp, Users, Shield, Check, Building } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      description: 'Idéal pour découvrir Starlinko',
      features: [
        '1 fiche Google Business',
        '10 réponses automatiques par mois',
        'Accès mobile',
        'Tableau de bord basique',
      ],
      color: 'from-[#34A853] to-[#34A853]/80',
    },
    {
      name: 'Pro',
      price: '29€',
      description: 'Pour les petites entreprises ambitieuses',
      features: [
        '5 fiches Google Business',
        'Réponses IA illimitées',
        'Statistiques avancées',
        'Support prioritaire',
      ],
      color: 'from-[#4285F4] to-[#34A853]',
    },
    {
      name: 'Agence',
      price: '99€',
      description: 'Pour les agences et réseaux multi-sites',
      features: [
        'Fiches illimitées',
        'Automatisation complète',
        'Rapports personnalisés',
        'Support dédié 24/7',
      ],
      color: 'from-[#FBBC05] to-[#EA4335]',
    },
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

      {/* Hero */}
      <section className="pt-20 pb-16 px-4 min-h-screen flex items-center">
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
      <section className="py-16 bg-white/10 backdrop-blur-md">
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
                Répondez automatiquement avec des messages personnalisés générés par l'IA.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Mobile First</h3>
              <p className="text-white/80">
                Interface optimisée pour mobile, gérez vos avis partout.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Analytics</h3>
              <p className="text-white/80">
                Suivez vos performances et l'évolution de votre réputation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Nos Tarifs</h2>
          <p className="text-white/80 mb-12">
            Choisissez le plan qui correspond à votre entreprise
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-gradient-to-br ${plan.color} rounded-2xl p-8 text-white shadow-lg hover:scale-105 transition-transform`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-4xl font-extrabold mb-4">{plan.price}</p>
                <p className="mb-6 text-white/80">{plan.description}</p>
                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="w-4 h-4 mr-2" /> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={onGetStarted}
                  className="bg-white text-[#4285F4] font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-all w-full"
                >
                  Choisir ce plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mentions légales */}
      <section className="py-16 bg-black/30 backdrop-blur-md border-t border-white/20 text-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6 text-center">Mentions légales</h2>
          <div className="space-y-4 text-sm text-white/80 leading-relaxed">
            <p><strong>Éditeur du site :</strong> SWEET DECO / Starlinko</p>
            <p><strong>Raison sociale :</strong> SWEET DECO — société spécialisée dans la création d’outils numériques pour la gestion d’avis clients et la communication d’entreprise.</p>
            <p><strong>Siège social :</strong> 280 Boulevard de la Boissière, 93100 Montreuil, France</p>
            <p><strong>Directeur de publication :</strong> Benyahya Otmane</p>
            <p><strong>Email :</strong> contact@starlinko.com</p>
            <p><strong>Hébergement :</strong> Bolt / Vercel — hébergement cloud sécurisé en Europe</p>
            <p><strong>Propriété intellectuelle :</strong> Le contenu, les visuels et le logo Starlinko / Sweet Deco sont protégés par le droit d’auteur. Toute reproduction est interdite sans autorisation préalable.</p>
            <p><strong>RGPD :</strong> Starlinko collecte uniquement les données nécessaires au bon fonctionnement de la plateforme. Vous disposez d’un droit d’accès, de modification et de suppression de vos données personnelles via l’adresse ci-dessus.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-md py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-white/70 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</a>
            <a href="/cookies" className="hover:text-white transition-colors">Politique des cookies</a>
            <a href="/gdpr" className="hover:text-white transition-colors">RGPD</a>
          </div>
          <p className="text-white/50 text-xs mt-4">
            © {new Date().getFullYear()} SWEET DECO / Starlinko — Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
