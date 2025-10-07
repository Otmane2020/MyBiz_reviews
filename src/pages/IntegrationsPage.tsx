import React from 'react';
import { ArrowLeft, Link2, Database, BarChart2, Zap } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const IntegrationsPage: React.FC = () => {
  const goBack = () => window.history.back();

  const integrations = [
    {
      icon: <Database className="w-8 h-8 text-[#4285F4]" />,
      name: "Google Business Profile",
      description:
        "Connectez vos établissements, avis et statistiques directement depuis votre compte Google.",
    },
    {
      icon: <BarChart2 className="w-8 h-8 text-[#34A853]" />,
      name: "Google Analytics",
      description:
        "Analysez vos performances locales et l’impact de vos avis sur votre trafic et vos conversions.",
    },
    {
      icon: <Zap className="w-8 h-8 text-[#FBBC05]" />,
      name: "Google Ads",
      description:
        "Améliorez vos campagnes publicitaires en intégrant les données de satisfaction client.",
    },
  ];

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
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="w-20 h-20 bg-[#34A853]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Link2 className="w-10 h-10 text-[#34A853]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Intégrations Starlinko
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Starlinko se connecte aux services Google pour centraliser toutes vos données marketing 
            et simplifier la gestion de votre réputation locale.
          </p>
        </div>

        {/* Integrations Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl transition"
            >
              <div className="flex justify-center mb-4">{integration.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{integration.name}</h3>
              <p className="text-gray-600 text-sm">{integration.description}</p>
            </div>
          ))}
        </div>

        {/* API Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
            API et intégrations personnalisées
          </h2>
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-6">
            En plus des services Google, <strong>Starlinko</strong> propose une API ouverte 
            pour connecter vos outils internes (CRM, ERP, applications métier) et synchroniser vos données en toute sécurité.
          </p>

          <div className="text-center">
            <a
              href="/contact"
              className="inline-block bg-[#4285F4] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#3367D6] transition-all transform hover:scale-105"
            >
              Contacter l’équipe technique
            </a>
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

export default IntegrationsPage;
