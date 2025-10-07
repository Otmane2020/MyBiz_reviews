import React from 'react';
import { ArrowLeft, Users, Target, Rocket, Shield } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const AboutPage: React.FC = () => {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4]/10 via-[#34A853]/10 to-[#FBBC05]/10 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={goBack}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <StarlinkoLogo size="md" showText />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            À propos de <span className="text-[#4285F4]">Starlinko</span>
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Nous aidons les entreprises à <strong>reprendre le contrôle</strong> de leur réputation en ligne 
            grâce à des outils puissants, intuitifs et alimentés par l’intelligence artificielle.
          </p>
        </div>

        {/* Mission Section */}
        <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
              <Target className="w-6 h-6 text-[#34A853] mr-2" /> Notre mission
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Simplifier la gestion des avis Google My Business pour toutes les entreprises — 
              qu’il s’agisse d’un restaurant, d’un salon ou d’une grande enseigne — 
              tout en garantissant une expérience fluide et intelligente grâce à l’IA.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <Rocket className="w-10 h-10 text-[#4285F4] mb-4" />
            <p className="text-gray-700 text-sm">
              Depuis sa création, <strong>Starlinko</strong> permet à des centaines d’entreprises 
              de répondre à leurs clients plus vite, mieux, et sans effort.
            </p>
          </div>
        </section>

        {/* Valeurs Section */}
        <section className="max-w-5xl mx-auto mb-20">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
            Nos valeurs fondamentales
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Shield className="w-8 h-8 text-[#4285F4] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Confiance</h3>
              <p className="text-gray-600 text-sm">
                La sécurité et la confidentialité de vos données sont notre priorité absolue.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Users className="w-8 h-8 text-[#34A853] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Proximité</h3>
              <p className="text-gray-600 text-sm">
                Nous écoutons nos utilisateurs et améliorons continuellement la plateforme selon leurs retours.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <Rocket className="w-8 h-8 text-[#FBBC05] mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
              <p className="text-gray-600 text-sm">
                Nous intégrons les dernières technologies d’intelligence artificielle 
                pour rendre vos tâches plus simples et plus intelligentes.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Une équipe passionnée</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-10">
            Derrière Starlinko se cache une équipe d’entrepreneurs, de développeurs et de passionnés de marketing 
            unis par la même vision : <strong>rendre la gestion de réputation simple, humaine et performante</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-white rounded-xl shadow-sm p-4 w-40">
              <img
                src="https://i.pravatar.cc/150?img=3"
                alt="Membre de l'équipe"
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h4 className="text-gray-900 font-semibold text-sm">Sophie L.</h4>
              <p className="text-gray-500 text-xs">CMO</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 w-40">
              <img
                src="https://i.pravatar.cc/150?img=12"
                alt="Membre de l'équipe"
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h4 className="text-gray-900 font-semibold text-sm">Lucas D.</h4>
              <p className="text-gray-500 text-xs">CTO</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 w-40">
              <img
                src="https://i.pravatar.cc/150?img=15"
                alt="Membre de l'équipe"
                className="w-24 h-24 rounded-full mx-auto mb-3"
              />
              <h4 className="text-gray-900 font-semibold text-sm">Emma R.</h4>
              <p className="text-gray-500 text-xs">CEO</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Starlinko — Tous droits réservés.
      </footer>
    </div>
  );
};

export default AboutPage;
