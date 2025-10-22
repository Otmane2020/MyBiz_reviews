import React, { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Star, Gift } from 'lucide-react';
import StarlinkoLogo from '../components/StarlinkoLogo';

const SuccessPage: React.FC = () => {
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('session_id');
    if (id) {
      setSessionId(id);
    }
  }, []);

  const goToDashboard = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <StarlinkoLogo size="lg" showText={true} className="text-white justify-center" />
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#34A853]/10 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[#34A853]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Paiement réussi ! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            Félicitations ! Votre abonnement Starlinko est maintenant actif. 
            Vous bénéficiez de 14 jours d'essai gratuit pour tester toutes nos fonctionnalités.
          </p>

          {/* Trial Benefits */}
          <div className="bg-gradient-to-r from-[#4285F4]/10 to-[#34A853]/10 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center mb-3">
              <Gift className="w-6 h-6 text-[#FBBC05] mr-2" />
              <span className="font-semibold text-gray-900">Essai gratuit de 14 jours</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center">
                <Star className="w-4 h-4 text-[#FBBC05] mr-2" />
                Réponses IA illimitées pendant l'essai
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-[#FBBC05] mr-2" />
                Accès à toutes les fonctionnalités premium
              </li>
              <li className="flex items-center">
                <Star className="w-4 h-4 text-[#FBBC05] mr-2" />
                Support prioritaire inclus
              </li>
            </ul>
          </div>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-3 mb-6">
              <p className="text-xs text-gray-500">ID de session</p>
              <p className="text-sm font-mono text-gray-700 break-all">{sessionId}</p>
            </div>
          )}

          <button
            onClick={goToDashboard}
            className="w-full flex items-center justify-center px-6 py-3 bg-[#4285F4] text-white rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 font-medium"
          >
            Accéder au tableau de bord
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Vous recevrez un email de confirmation sous peu
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;