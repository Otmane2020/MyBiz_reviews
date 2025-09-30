      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        }
      });
      
      if (error) {
        console.error('Error during Google OAuth:', error);
        throw error;
      }
      
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import StarlinkoLogo from './StarlinkoLogo';
import { supabase } from '../lib/supabase';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Exchange code for tokens
      fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });
    }
  }, []);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use Supabase native Google OAuth with specific configuration
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        }
      });
      
      if (error) {
        console.error('Error during Google OAuth:', error);
        throw error;
      }
      
      
      if (error) {
        console.error('Error during Google OAuth:', error);
        throw error;
      }
      
    } catch (error) {
      console.error('Erreur d\'authentification Google:', error);
      alert('Erreur lors de la connexion avec Google');
      setLoading(false);
      if (error?.message && error.message.includes('redirect_uri_mismatch')) {
        alert('Erreur de configuration OAuth. Veuillez contacter le support.');
      }
      if (error?.message && error.message.includes('redirect_uri_mismatch')) {
        alert('Erreur de configuration OAuth. Veuillez contacter le support.');
      }
      if (error?.message && error.message.includes('redirect_uri_mismatch')) {
        alert('Erreur de configuration OAuth. Veuillez contacter le support.');
      }
    }
  };

  const handleGoogleAuth2 = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Use Supabase native Google OAuth with specific configuration
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        }
      });
      
      if (error) {
        console.error('Error during Google OAuth:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
      } else {
        // Sign up with email and password
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
            }
          }
        });
        
        if (error) throw error;
        
        // Show success message for sign up
        setError('');
        alert('Compte créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      }
      
    } catch (error: any) {
      console.error('Erreur d\'authentification:', error);
      if (error?.message) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou mot de passe incorrect');
        } else if (error.message.includes('Password should be at least 6 characters')) {
          setError('Le mot de passe doit contenir au moins 6 caractères');
        } else if (error.message.includes('User already registered')) {
          setError('Un compte existe déjà avec cet email');
        } else {
          setError(error.message);
        }
      } else {
        setError('Erreur lors de la connexion');
      }
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 shadow-sm mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4285F4] text-white py-3 px-4 rounded-lg hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4285F4] transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'Créer un compte')}
            </button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="text-center mt-6">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#4285F4] hover:text-[#3367D6] font-medium"
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