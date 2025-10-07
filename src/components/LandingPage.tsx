import React from 'react';
import { Star, MessageSquare, Smartphone, TrendingUp, Users, Shield } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
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

      {/* CTA */}
      <section className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Prêt à connecter vos avis ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des centaines d'entreprises qui font confiance à Starlinko
          </p>
          <button
            onClick={onGetStarted}
            className="bg-[#EA4335] text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-[#d33b2c] transition-all transform hover:scale-105 shadow-lg"
          >
            Commencer maintenant
          </button>
        </div>
      </section>

      {/* Footer — version simplifiée */}
      <footer className="bg-black/30 backdrop-blur-md py-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-white/70 text-sm">
            <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="/terms" className="hover:text-white transition-colors">Conditions d'utilisation</a>
            <a href="/cookies" className="hover:text-white transition-colors">Politique des cookies</a>
            <a href="/gdpr" className="hover:text-white transition-colors">RGPD</a>
          </div>
          <p className="text-white/50 text-xs mt-4">
            © {new Date().getFullYear()} Starlinko. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
