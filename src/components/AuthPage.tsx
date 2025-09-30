import React, { useState } from 'react';
import { Star, TrendingUp, MessageSquare } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';
import { supabase } from '../lib/supabase';

// Utiliser la variable d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthPageProps {
  onGoogleAuth: (userData: any, token: string) => void;
  onEmailAuth: (userData: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onGoogleAuth, onEmailAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = (isTrial: boolean = false) => {
    console.log('Google Client ID:', GOOGLE_CLIENT_ID);
    console.log('Is trial signup:', isTrial);
    
    // Set the trial signup flag before OAuth redirect
    if (isTrial) {
      localStorage.setItem('isTrialSignup', 'true');
      console.log('✅ Set isTrialSignup = true for trial signup');
    } else {
      localStorage.setItem('isTrialSignup', 'false');
      console.log('✅ Set isTrialSignup = false for regular login');
    }
    
    // Set loading state
    setLoading(true);
    
    try {
      // Use Supabase native Google OAuth
      supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        }
      });
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
            {!isLogin ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Essayez gratuitement
                </h2>
                <p className="text-gray-600">
                  14 jours d'essai gratuit • Aucune carte requise
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Bon retour !
                </h2>
                <p className="text-gray-600">
                  Connectez-vous à votre compte Starlinko
                </p>
              </>
            )}
          </div>

          {/* Bouton Essayer gratuitement pour nouveaux clients (mode connexion) */}
          {isLogin && (
            <div className="mb-6">
              <button
                onClick={() => handleGoogleAuth(true)}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-[#34A853] to-[#4285F4] text-white rounded-lg hover:from-[#2D8A47] hover:to-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Essayer gratuitement
              </button>
              <div className="text-center text-xs text-gray-500 mt-2">
                ✨ 14 jours d'essai gratuit • Aucune carte requise
              </div>
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={() => handleGoogleAuth(false)}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connexion...' : (isLogin ? 'Se connecter avec Google' : 'Essayer gratuitement avec Google')}
          </button>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#4285F4] hover:underline text-sm"
            >
              {isLogin ? (
                'Nouveau sur Starlinko ? Essayez gratuitement'
              ) : (
                'Vous avez déjà un compte ? Connectez-vous'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;