import React from 'react';
import { ArrowLeft, PlayCircle, CheckCircle } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const DemoPage: React.FC = () => {
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

      {/* Section principale */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-20 bg-[#4285F4]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <PlayCircle className="w-10 h-10 text-[#4285F4]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Démonstration Starlinko
          </h1>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Découvrez comment <strong>Starlinko</strong> simplifie la gestion de vos avis Google My Business 
            grâce à l’automatisation, l’IA et une interface intuitive.
          </p>

          {/* Vidéo de démonstration */}
          <div className="relative aspect-video max-w-3xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/3fumBcKC6RE?autoplay=0&rel=0"
              title="Démonstration Starlinko"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>

          {/* Points clés */}
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-[#34A853] mr-2" />
                <h3 className="font-semibold text-gray-900">Connexion Google rapide</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Connectez votre compte Google Business Profile en toute sécurité grâce à OAuth 2.0.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-[#34A853] mr-2" />
                <h3 className="font-semibold text-gray-900">IA intégrée</h3>
              </div>
              <p className="text-gray-600 text-sm">
                L’intelligence artificielle répond automatiquement à vos avis clients de façon naturelle et personnalisée.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center mb-3">
                <CheckCircle className="w-5 h-5 text-[#34A853] mr-2" />
                <h3 className="font-semibold text-gray-900">Suivi analytique</h3>
              </div>
              <p className="text-gray-600 text-sm">
                Visualisez vos performances locales et l’évolution de votre réputation en temps réel.
              </p>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-16">
            <button
              onClick={() => window.location.href = '/pricing'}
              className="bg-[#4285F4] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#3367D6] transition-all transform hover:scale-105"
            >
              Essayer gratuitement
            </button>
            <p className="text-gray-500 text-sm mt-3">
              ✨ 14 jours d’essai gratuit — aucune carte requise
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Starlinko — Tous droits réservés.
      </footer>
    </div>
  );
};

export default DemoPage;
