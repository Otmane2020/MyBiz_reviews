import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';

// Utiliser la variable d'environnement
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

interface AuthPageProps {
  onGoogleAuth: (userData: any, token: string) => void;
  onEmailAuth: (userData: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onGoogleAuth, onEmailAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  const handleGoogleAuth = () => {
    console.log('Google Client ID:', GOOGLE_CLIENT_ID);
    
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
      alert('Configuration Google OAuth manquante ou invalide. Client ID: ' + GOOGLE_CLIENT_ID);
      return;
    }

    setLoading(true);
    
    const redirectUri = window.location.origin;
    console.log('Redirect URI:', redirectUri);
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${GOOGLE_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent('https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email')}&` +
      `access_type=offline&` +
      `prompt=consent`;
    
    console.log('Auth URL:', authUrl);
    
    const popup = window.open(
      authUrl,
      'google-oauth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      alert('Les popups sont bloquées. Veuillez autoriser les popups pour ce site.');
      setLoading(false);
      return;
    }

    // Listen for popup messages
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
        console.log('Received auth code:', event.data.code);
        handleOAuthCallback(event.data.code);
        window.removeEventListener('message', handleMessage);
      }
    };

    window.addEventListener('message', handleMessage);
    
    // Check if popup is closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setLoading(false);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  };

  const handleOAuthCallback = async (code: string) => {
    try {
      console.log('Exchanging code for token...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase configuration missing:', {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseKey,
          url: supabaseUrl ? 'Present' : 'Missing',
          key: supabaseKey ? 'Present' : 'Missing'
        });
        alert('Configuration Supabase manquante. Veuillez vérifier les variables d\'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.');
        return;
      }
      
      const response = await fetch(`${supabaseUrl}/functions/v1/google-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          action: 'exchange-code',
          code,
          redirectUri: window.location.origin,
        }),
      });

      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Si ce n'est pas du JSON, c'est probablement une erreur HTML
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        
        if (text.includes('<!DOCTYPE')) {
          throw new Error('Erreur de configuration Supabase. Vérifiez que la fonction google-oauth est déployée.');
        } else {
          throw new Error(`Réponse inattendue du serveur: ${text.substring(0, 100)}...`);
        }
      }
      
      console.log('OAuth response:', data);
      
      if (response.ok) {
        console.log('OAuth success, calling onGoogleAuth');
        onGoogleAuth(data.user, data.access_token);
      } else {
        console.error('OAuth error:', data.error);
        alert(`Erreur lors de la connexion Google: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'échange du code:', error);
      alert(`Erreur lors de la connexion: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    
    try {
      // Simulate email auth (you can integrate with Supabase Auth here)
      const userData = {
        id: Date.now().toString(),
        email: formData.email,
        name: formData.fullName || formData.email.split('@')[0],
        picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName || formData.email)}&background=4285F4&color=fff`,
        authMethod: 'email'
      };
      
      onEmailAuth(userData);
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      alert('Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <StarlinkoLogo size="lg" showText={true} className="text-white justify-center" />
          <p className="text-white/90 mt-2">Gérez vos avis Google My Business</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Connexion' : 'Créer un compte'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Connectez-vous à votre compte' : 'Rejoignez Starlinko aujourd\'hui'}
            </p>
          </div>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 shadow-sm mb-6 disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Connexion...' : 'Continuer avec Google'}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">ou</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom complet
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="Votre nom complet"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
                    placeholder="••••••••"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4285F4] text-white py-3 px-4 rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer le compte')}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#4285F4] hover:underline text-sm"
            >
              {isLogin ? 'Pas encore de compte ? Créer un compte' : 'Déjà un compte ? Se connecter'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;