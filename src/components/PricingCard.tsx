import React, { useState } from 'react';
import { StripeProduct } from '../stripe-config';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PricingCardProps {
  product: StripeProduct;
  isPopular?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ product, isPopular }) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Veuillez vous connecter pour continuer');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: product.priceId,
          userId: user.id,
        }),
      });

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const isAnnual = product.name.includes('Annual');

  return (
    <div className={`relative bg-white rounded-lg shadow-lg p-6 ${isPopular ? 'ring-2 ring-blue-500' : ''}`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Populaire
          </span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <div className="text-3xl font-bold text-gray-900">
          {formatPrice(product.price)}
          <span className="text-lg font-normal text-gray-600">
            /{isAnnual ? 'an' : 'mois'}
          </span>
        </div>
        {isAnnual && (
          <div className="text-sm text-green-600 font-medium mt-1">
            Économisez 20%
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="text-sm text-gray-600 leading-relaxed">
          {product.description.split(/(?=[A-Z][a-z]|\d+)/).map((feature, index) => (
            <div key={index} className="flex items-start mb-2">
              <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span>{feature.trim()}</span>
            </div>
          ))}
        </div>
      </div>
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
          isPopular
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
        } disabled:opacity-50 flex items-center justify-center`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          'Choisir ce plan'
        )}
      </button>
    </div>
  );
};