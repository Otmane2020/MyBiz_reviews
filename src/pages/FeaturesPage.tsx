import React from 'react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const PricingPage: React.FC = () => {
  const goBack = () => window.history.back();

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          <button
            onClick={goBack}
            className="mr-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <StarlinkoLogo size="md" showText />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-[#FBBC05]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-[#FBBC05]" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tarifs</h1>
          <p className="text-gray-600 mb-8">Des plans simples et transparents pour chaque entreprise</p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-bold mb-2">Essai gratuit</h3>
              <p className="text-gray-600 mb-4">0€ / 14 jours</p>
              <p className="text-sm text-gray-500 mb-4">Sans carte bancaire</p>
              <button className="bg-[#4285F4] text-white px-4 py-2 rounded-full">Essayer</button>
            </div>
            <div className="border rounded-xl p-6 bg-white shadow">
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <p className="text-gray-600 mb-4">29€ / mois</p>
              <p className="text-sm text-gray-500 mb-4">IA + Analytique + Multi-locations</p>
              <button className="bg-[#34A853] text-white px-4 py-2 rounded-full">Souscrire</button>
            </div>
            <div className="border rounded-xl p-6 bg-gray-50">
              <h3 className="text-lg font-bold mb-2">Entreprise</h3>
              <p className="text-gray-600 mb-4">Sur devis</p>
              <p className="text-sm text-gray-500 mb-4">Solutions personnalisées</p>
              <button className="bg-[#EA4335] text-white px-4 py-2 rounded-full">Contact</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PricingPage;
