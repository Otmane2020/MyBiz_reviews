import React, { useState } from 'react';
import { CreditCard, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useStripe } from '../hooks/useStripe';

const StripeSetup: React.FC = () => {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const { createProducts, fetchProducts, products, loading } = useStripe();

  const handleCreateProducts = async () => {
    setSetupStatus('creating');
    setErrorMessage('');
    
    try {
      await createProducts();
      setSetupStatus('success');
    } catch (error) {
      setSetupStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  const handleFetchProducts = async () => {
    try {
      await fetchProducts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la récupération');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <CreditCard className="w-12 h-12 text-[#4285F4] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Configuration Stripe
          </h1>
          <p className="text-gray-600">
            Configurez vos produits et prix Stripe pour Starlinko
          </p>
        </div>

        {/* Status */}
        {setupStatus === 'success' && (
          <div className="bg-[#34A853]/10 border border-[#34A853]/20 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-[#34A853] mr-3" />
              <div>
                <h3 className="font-medium text-[#34A853]">Produits créés avec succès !</h3>
                <p className="text-sm text-[#34A853]/80">
                  Tous les produits Starlinko ont été créés dans votre compte Stripe.
                </p>
              </div>
            </div>
          </div>
        )}

        {setupStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Erreur de configuration</h3>
                <p className="text-sm text-red-600">{errorMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4 mb-8">
          <button
            onClick={handleCreateProducts}
            disabled={setupStatus === 'creating' || loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {setupStatus === 'creating' ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Création des produits...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Créer les produits Stripe
              </>
            )}
          </button>

          <button
            onClick={handleFetchProducts}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Chargement...
              </>
            ) : (
              'Actualiser les produits'
            )}
          </button>
        </div>

        {/* Products List */}
        {products.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Produits Stripe ({products.length})
            </h3>
            <div className="space-y-4">
              {products.map((product) => (
                <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <span className="text-sm text-gray-500">ID: {product.id}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {product.prices.map((price) => (
                      <div key={price.id} className="bg-gray-50 rounded p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {price.nickname}
                          </span>
                          <span className="text-lg font-bold text-[#4285F4]">
                            €{(price.unit_amount / 100).toFixed(2)}
                            <span className="text-sm text-gray-500">
                              /{price.recurring.interval === 'month' ? 'mois' : 'an'}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ID: {price.id}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Assurez-vous que votre clé secrète Stripe est configurée dans les variables d'environnement</li>
            <li>Cliquez sur "Créer les produits Stripe" pour créer automatiquement tous les plans</li>
            <li>Configurez les webhooks Stripe pour pointer vers votre fonction stripe-webhook</li>
            <li>Testez les paiements en mode test avant de passer en production</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default StripeSetup;