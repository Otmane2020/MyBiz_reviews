import React from 'react';
import { stripeProducts } from '../stripe-config';
import { PricingCard } from '../components/PricingCard';

export const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gérez vos avis Google My Business avec l'IA et automatisez vos réponses
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stripeProducts.map((product, index) => (
            <PricingCard
              key={product.priceId}
              product={product}
              isPopular={index === 2} // Pro plan
            />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Tous les plans incluent une période d'essai gratuite de 14 jours
          </p>
        </div>
      </div>
    </div>
  );
};