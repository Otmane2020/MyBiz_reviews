import React from 'react';
import { ArrowLeft, CreditCard, Check } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const PricingPage: React.FC = () => {
  const goBack = () => window.history.back();

  const plans = [
    {
      name: "Starter",
      price: "0€",
      color: "from-[#4285F4] to-[#34A853]",
      description: "Idéal pour découvrir la plateforme et gérer un seul établissement.",
      features: [
        "1 établissement",
        "Réponses IA basiques",
        "Tableau de bord simplifié",
        "Support standard",
      ],
      buttonColor: "bg-[#4285F4] hover:bg-[#3367D6]",
      cta: "Essayer gratuitement",
    },
    {
      name: "Pro",
      price: "29€/mois",
      color: "from-[#34A853] to-[#FBBC05]",
      description: "Conçu pour les entreprises multi-établissements souhaitant automatiser leurs avis.",
      features: [
        "Jusqu’à 5 établissements",
        "Réponses IA avancées",
        "Statistiques complètes",
        "Support prioritaire",
      ],
      buttonColor: "bg-[#34A853] hover:bg-[#2C8A45]",
      cta: "Choisir le plan Pro",
      popular: true,
    },
    {
      name: "Entreprise",
      price: "Sur devis",
      color: "from-[#FBBC05] to-[#EA4335]",
      description: "Solution sur mesure pour réseaux de franchises et grandes enseignes.",
      features: [
        "Nombre d’établissements illimité",
        "Automatisations personnalisées",
        "Formation dédiée",
        "Accompagnement expert",
      ],
      buttonColor: "bg-[#EA4335] hover:bg-[#D93025]",
      cta: "Contacter l’équipe",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F4] flex flex-col">
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

      {/* Main Section */}
      <main className="flex-grow py-16 px-4 bg-gradient-to-br from-[#4285F4]/10 via-[#34A853]/10 to-[#FBBC05]/10">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Tarifs</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choisissez le plan qui s’adapte à votre entreprise.  
            Tous les abonnements incluent la sécurité OAuth Google et l’accès complet à votre tableau de bord.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 shadow-lg bg-white hover:shadow-2xl transition-all duration-300 border border-gray-200`}
            >
              {/* Badge populaire */}
              {plan.popular && (
                <div className="absolute -top-3 right-6 bg-[#34A853] text-white text-xs px-3 py-1 rounded-full shadow-md">
                  Populaire
                </div>
              )}

              {/* Title */}
              <div
                className={`text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${plan.color}`}
              >
                {plan.name}
              </div>

              <p className="text-gray-600 mb-6">{plan.description}</p>
              <div className="text-4xl font-bold mb-6">{plan.price}</div>

              <ul className="text-gray-700 text-sm space-y-2 mb-8 text-left">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="w-4 h-4 text-[#34A853] mr-2" /> {f}
                  </li>
                ))}
              </ul>

              <button
                className={`${plan.buttonColor} text-white w-full py-3 rounded-full font-semibold transition-transform hover:scale-105`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer simple */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Starlinko — Tous droits réservés.
      </footer>
    </div>
  );
};

export default PricingPage;
