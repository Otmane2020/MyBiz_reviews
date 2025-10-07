import React from 'react';
import {
  Star,
  MessageSquare,
  Smartphone,
  TrendingUp,
  Users,
  Shield,
  Check
} from 'lucide-react';
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
            <StarlinkoLogo size="md" showGoogleIcon className="text-white" />
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
          <button
            onClick={onGetStarted}
            className="bg-white text-[#4285F4] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Essayer gratuitement
          </button>
          <p className="text-white/80 text-sm mt-4">
            ✨ 14 jours d'essai gratuit • Aucune carte requise
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Pourquoi choisir Starlinko ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Feature icon={<MessageSquare />} title="Réponses IA" text="Répondez automatiquement avec des messages personnalisés générés par l'IA" />
            <Feature icon={<Smartphone />} title="Mobile First" text="Interface optimisée pour mobile, gérez vos avis partout" />
            <Feature icon={<TrendingUp />} title="Analytics" text="Suivez vos performances et l'évolution de votre réputation" />
          </div>
        </div>
      </section>

      {/* 💰 Pricing Section */}
      <section className="py-20 bg-white/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Nos Tarifs</h2>
          <p className="text-white/80 mb-12">
            Des plans simples et transparents adaptés à vos besoins
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">Essai Gratuit</h3>
              <p className="text-white/70 mb-6">Pour découvrir la plateforme</p>
              <div className="text-4xl font-bold text-white mb-6">0€</div>
              <ul className="text-left text-white/80 space-y-3 mb-8">
                <PricingFeature text="1 établissement" />
                <PricingFeature text="Jusqu’à 20 avis" />
                <PricingFeature text="Réponses IA limitées" />
              </ul>
              <button
                onClick={onGetStarted}
                className="bg-white text-[#4285F4] w-full py-3 rounded-full font-semibold hover:bg-gray-100 transition"
              >
                Commencer
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-2xl p-8 shadow-xl transform scale-105 border-2 border-[#4285F4]">
              <h3 className="text-2xl font-bold text-[#4285F4] mb-2">Pro</h3>
              <p className="text-gray-600 mb-6">Idéal pour les PME locales</p>
              <div className="text-4xl font-bold text-[#4285F4] mb-6">39€<span className="text-lg text-gray-500">/mois</span></div>
              <ul className="text-left text-gray-700 space-y-3 mb-8">
                <PricingFeature text="Jusqu’à 5 établissements" />
                <PricingFeature text="Avis illimités" />
                <PricingFeature text="Réponses automatiques IA" />
                <PricingFeature text="Statistiques & rapports" />
              </ul>
              <button
                onClick={onGetStarted}
                className="bg-[#4285F4] text-white w-full py-3 rounded-full font-semibold hover:bg-[#3367D6] transition"
              >
                Essayer Pro
              </button>
            </div>

            {/* Business Plan */}
            <div className="bg-white/10 rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-2">Business</h3>
              <p className="text-white/70 mb-6">Pour les grandes enseignes</p>
              <div className="text-4xl font-bold text-white mb-6">99€<span className="text-lg text-white/60">/mois</span></div>
              <ul className="text-left text-white/80 space-y-3 mb-8">
                <PricingFeature text="Multi-comptes & équipes" />
                <PricingFeature text="API & intégrations avancées" />
                <PricingFeature text="Support prioritaire 24/7" />
              </ul>
              <button
                onClick={onGetStarted}
                className="bg-[#34A853] text-white w-full py-3 rounded-full font-semibold hover:bg-[#2c8c44] transition"
              >
                Contactez-nous
              </button>
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
          <p className="text-white/80 text-sm mt-4">🚀 Configuration en 2 minutes</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-md py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center mb-6">
            <StarlinkoLogo size="md" showText className="text-white" />
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center md:text-left mb-8">
            <FooterColumn title="Produit" links={[
              { label: "Fonctionnalités", href: "/features" },
              { label: "Tarifs", href: "/pricing" },
              { label: "Démo", href: "/demo" },
              { label: "Intégrations", href: "/integrations" }
            ]} />
            <FooterColumn title="Entreprise" links={[
              { label: "À propos", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Contact", href: "/contact" },
              { label: "Communauté", href: "/community" }
            ]} />
            <FooterColumn title="Légal" links={[
              { label: "Confidentialité", href: "/privacy" },
              { label: "Conditions", href: "/terms" },
              { label: "Cookies", href: "/cookies" },
              { label: "RGPD", href: "/gdpr" }
            ]} />
          </div>
          <div className="border-t border-white/20 pt-6 text-center text-white/60 text-sm">
            © {new Date().getFullYear()} Starlinko — Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) => (
  <div className="text-center">
    <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-white/80">{text}</p>
  </div>
);

const PricingFeature = ({ text }: { text: string }) => (
  <li className="flex items-center gap-2">
    <Check className="w-4 h-4 text-[#34A853]" />
    <span>{text}</span>
  </li>
);

const FooterColumn = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
  <div>
    <h4 className="text-white font-semibold mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.href}>
          <a href={link.href} className="text-white/70 hover:text-white transition">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
