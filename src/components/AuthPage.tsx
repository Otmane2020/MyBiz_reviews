import React, { useState } from 'react';
import { Star, TrendingUp, MessageSquare } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';
import { supabase } from '../lib/supabase';

// Utiliser la variable d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthPageProps {
  onGoogleAuth: () => void;
  onEmailAuth: (userData: any) => void;
  onGetStarted: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onGoogleAuth, onEmailAuth, onGetStarted }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = () => {
    console.log('Google Client ID:', GOOGLE_CLIENT_ID);
    
    try {
      // Appeler la fonction onGoogleAuth passée en props
      onGoogleAuth();
    } catch (error) {
      console.error('Error signing in with Google:', error);
      alert('Erreur lors de la connexion avec Google. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <StarlinkoLogo size="lg" showText={true} className="text-white justify-center" />
          <h1 className="text-2xl font-bold text-white mt-4 mb-2">
            Transformez vos avis Google en opportunités
          </h1>
          <p className="text-white/90">
            Gérez automatiquement vos avis Google My Business avec l'IA
          </p>
        </div>

        {/* Features highlight */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/90 text-sm">Réponses IA</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/90 text-sm">Gestion avis</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-white/90 text-sm">Analytics</p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Transformez vos avis Google en opportunités
            </h2>
            <p className="text-gray-600">
              Gérez automatiquement vos avis Google My Business avec l'IA
            </p>
          </div>

          {/* Bouton principal Essayer gratuitement */}
          <div className="mb-6">
            <button
              onClick={onGetStarted}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#34A853] to-[#4285F4] text-white rounded-lg hover:from-[#2D8A47] hover:to-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-all duration-200 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : 'Essayer gratuitement'}
            </button>
            <div className="text-center text-xs text-gray-500 mt-2">
              ✨ 14 jours d'essai gratuit • Aucune carte requise
            </div>
          </div>

          {/* Séparateur */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Section connexion pour clients existants */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bon retour !
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Connectez-vous à votre compte Starlinko
            </p>
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Connexion...' : 'Se connecter avec Google'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AuthPage;