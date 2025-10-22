import React from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { getProductByPriceId } from '../stripe-config';
import { Crown, Loader2 } from 'lucide-react';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="text-gray-600">
        Aucun abonnement actif
      </div>
    );
  }

  const product = getProductByPriceId(subscription.stripe_price_id);

  return (
    <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-md">
      <Crown className="w-4 h-4" />
      <span className="font-medium">
        Plan {product?.name || 'Actif'}
      </span>
    </div>
  );
};