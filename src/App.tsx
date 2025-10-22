import React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import SuperAdmin from './pages/SuperAdmin';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import GoogleBusinessSetup from './components/GoogleBusinessSetup';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import MobileMenu from './components/MobileMenu';
import Dashboard from './components/Dashboard';
import GoogleReviews from './pages/GoogleReviews';
import GoogleMyBusinessPage from './pages/GoogleMyBusinessPage';
import SettingsPage from './components/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import AISettingsPage from './components/AISettingsPage';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'google-setup' | 'onboarding' | 'app'>('landing');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // Notifications hook - must be at top level
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useReviewsNotifications(selectedLocationId);

  // Check if current path is /superadmin
  const isSuperAdminRoute = window.location.pathname === '/superadmin';
  
  // Check if current path is /success
  const isSuccessRoute = window.location.pathname === '/success';

  // Initialize Supabase auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email,
          email: session.user.email,
          picture: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email)}&background=4285F4&color=fff`,
          authMethod: 'google'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Extract Google access token if available
        if (session.provider_token) {
          setAccessToken(session.provider_token);
          localStorage.setItem('accessToken', session.provider_token);
        }
        
        // Check if user has completed onboarding
        const completedOnboarding = localStorage.getItem('onboardingCompleted');
        if (completedOnboarding) {
          setHasCompletedOnboarding(true);
          setCurrentView('app');
        } else {
          setCurrentView('google-setup');
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email,
          email: session.user.email,
          picture: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email)}&background=4285F4&color=fff`,
          authMethod: 'google'
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Extract Google access token if available
        if (session.provider_token) {
          setAccessToken(session.provider_token);
          localStorage.setItem('accessToken', session.provider_token);
        }
        
        // Check if user has completed onboarding
        const completedOnboarding = localStorage.getItem('onboardingCompleted');
        if (completedOnboarding) {
          setHasCompletedOnboarding(true);
          setCurrentView('app');
        } else {
          setCurrentView('google-setup');
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccessToken('');
        setSelectedAccountId('');
        setSelectedLocationId('');
        setCurrentPage('dashboard');
        setHasCompletedOnboarding(false);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('selectedAccountId');
        localStorage.removeItem('selectedLocationId');
        localStorage.removeItem('onboardingCompleted');
        setCurrentView('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check for existing session
  useEffect(() => {
    // Only check localStorage if no Supabase session is found
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('accessToken');
        const savedAccountId = localStorage.getItem('selectedAccountId');
        const savedLocationId = localStorage.getItem('selectedLocationId');
        const completedOnboarding = localStorage.getItem('onboardingCompleted');

        if (savedUser) {
          setUser(JSON.parse(savedUser));
          if (savedToken) setAccessToken(savedToken);
          if (savedAccountId) setSelectedAccountId(savedAccountId);
          if (savedLocationId) setSelectedLocationId(savedLocationId);
          setHasCompletedOnboarding(!!completedOnboarding);
          setCurrentView('app');
        } else {
          // Show landing page for new users
          setCurrentView('landing');
        }
      }
    });
  }, []);

  // Remove the old OAuth callback handling
  /*
  // Listen for OAuth popup messages
  useEffect(() => {
    // Handle OAuth callback directly in main window (not popup)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !user) {
      console.log('OAuth callback detected with code:', code);
      handleDirectOAuthCallback(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.code) {
        // This will be handled by AuthPage component
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  */

  const handleDirectOAuthCallback = async (code: string) => {
    try {
      console.log('Processing OAuth callback...');
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      console.log('Environment variables check:', {
        supabaseUrl: supabaseUrl || 'MISSING',
        supabaseKey: supabaseKey ? 'Present' : 'MISSING',
        allEnvVars: import.meta.env
      });
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase configuration missing');
        const errorMsg = `❌ Configuration Supabase manquante:\n• URL: ${supabaseUrl || 'MANQUANTE'}\n• Clé: ${supabaseKey ? 'Présente' : 'MANQUANTE'}\n\nVeuillez configurer les variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY`;
        alert(errorMsg);
        // Redirect to home page after error
        window.location.href = '/';
        return;
      }
      
      if (supabaseUrl.includes('your-project-id')) {
        alert('❌ ERREUR: Variables d\'environnement non configurées\n\nLes variables contiennent encore des valeurs par défaut.\nVeuillez créer un fichier .env avec vos vraies valeurs Supabase.');
        // Redirect to home page after error
        window.location.href = '/';
        return;
      }
      
      console.log('🔄 Calling Supabase Edge Function for OAuth...');
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

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.error('❌ Non-JSON response received:', textResponse);
        
        if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html>')) {
          alert('❌ ERREUR: Fonction Supabase non disponible\n\nLa fonction Edge "google-oauth" n\'est pas déployée ou accessible.\n\nVérifiez:\n• Que la fonction est déployée dans Supabase\n• Que l\'URL Supabase est correcte\n• Les logs de la fonction dans le dashboard Supabase');
          // Redirect to home page after error
          window.location.href = '/';
          return;
        } else {
          alert(`❌ ERREUR: Réponse inattendue du serveur\n\nType de contenu: ${contentType || 'inconnu'}\nRéponse: ${textResponse.substring(0, 200)}...`);
          // Redirect to home page after error
          window.location.href = '/';
          return;
        }
      }
      
      if (response.ok && data.user && data.access_token) {
        console.log('✅ OAuth success, setting user data');
        setUser(data.user);
        setAccessToken(data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.access_token);
        
        // Clean URL and redirect to setup
        window.history.replaceState({}, document.title, window.location.pathname);
        setCurrentView('google-setup');
      } else {
        console.error('❌ OAuth error:', data);
        
        let errorMessage = '❌ ERREUR de connexion Google My Business\n\n';
        
        if (data.error) {
          if (typeof data.error === 'string') {
            errorMessage += `Détails: ${data.error}`;
          } else if (data.error.message) {
            errorMessage += `Message: ${data.error.message}`;
            if (data.error.code) {
              errorMessage += `\nCode: ${data.error.code}`;
            }
          } else {
            errorMessage += `Erreur: ${JSON.stringify(data.error)}`;
          }
        } else {
          errorMessage += 'Erreur inconnue - Vérifiez les logs de la console';
        }
        
        errorMessage += '\n\n🔍 Vérifications suggérées:';
        errorMessage += '\n• Variables d\'environnement Google configurées';
        errorMessage += '\n• Fonction Edge "google-oauth" déployée';
        errorMessage += '\n• Client ID Google valide';
        errorMessage += '\n• API Google My Business activée';
        
        alert(errorMessage);
        // Redirect to home page after error
        window.location.href = '/';
      }
    } catch (error) {
      console.error('💥 Error processing OAuth callback:', error);
      
      let errorMessage = '❌ ERREUR CRITIQUE lors de la connexion\n\n';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage += 'Problème de réseau ou URL Supabase incorrecte\n\n';
        errorMessage += `URL utilisée: ${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-oauth\n\n`;
        errorMessage += '🔍 Vérifiez:\n';
        errorMessage += '• Connexion internet\n';
        errorMessage += '• URL Supabase correcte\n';
        errorMessage += '• Fonction Edge déployée';
      } else {
        errorMessage += `Détails: ${error.message}\n\n`;
        errorMessage += '🔍 Consultez la console pour plus de détails';
      }
      
      alert(errorMessage);
      // Redirect to home page after error
      window.location.href = '/';
    }
  };

  // Check if we're in OAuth popup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && window.opener) {
      // We're in a popup, send code to parent
      window.opener.postMessage({
        type: 'GOOGLE_AUTH_SUCCESS',
        code: code
      }, window.location.origin);
      window.close();
    }
  }, []);

  const handleGoogleAuth = (userData: any, token: string) => {
    // This function is no longer needed as Supabase handles auth state
    // The auth state listener will handle user data and navigation
  };

  const handleEmailAuth = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Check if user has already completed onboarding
    const completedOnboarding = localStorage.getItem('onboardingCompleted');
    if (completedOnboarding) {
      setHasCompletedOnboarding(true);
      setCurrentView('app');
    } else {
      setCurrentView('onboarding');
    }
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleGoogleSetupComplete = (accountId: string, locationId: string) => {
    setSelectedAccountId(accountId);
    setSelectedLocationId(locationId);
    localStorage.setItem('selectedAccountId', accountId);
    localStorage.setItem('selectedLocationId', locationId);
    
    // Check if user has already completed onboarding
    const completedOnboarding = localStorage.getItem('onboardingCompleted');
    if (completedOnboarding) {
      setHasCompletedOnboarding(true);
      setCurrentView('app');
    } else {
      setCurrentView('onboarding');
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    setCurrentView('app');
  };

  const handleOnboardingCompleteWithData = (selectedStores: string[], selectedPlan: string) => {
    // Save selected stores and plan
    localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
    localStorage.setItem('selectedPlan', selectedPlan);
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
    
    // Set the first selected store as the current location
    if (selectedStores.length > 0) {
      setSelectedLocationId(selectedStores[0]);
      localStorage.setItem('selectedLocationId', selectedStores[0]);
    }
    
    setCurrentView('app');
  };

  const handleLogout = () => {
    // Use Supabase signOut which will trigger the auth state listener
    supabase.auth.signOut();
  };

  // Handle Super Admin route
  if (isSuperAdminRoute) {
    return <SuperAdmin />;
  }
  
  // Handle Success route
  if (isSuccessRoute) {
    return <SuccessPage />;
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  if (currentView === 'landing') {
    return (
      <LandingPage onGetStarted={handleGetStarted} />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onGoogleAuth={handleGoogleAuth}
        onEmailAuth={handleEmailAuth}
      />
    );
  }

  if (currentView === 'google-setup') {
    return (
      <GoogleBusinessSetup
        accessToken={accessToken}
        onSetupComplete={handleGoogleSetupComplete}
      />
    );
  }

  if (currentView === 'onboarding') {
    return (
      <ComprehensiveOnboarding 
        user={user}
        accessToken={accessToken}
        onComplete={handleOnboardingCompleteWithData} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F4]">
      <MobileMenu
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearNotifications}
      />
      
      {currentPage === 'dashboard' && <Dashboard user={user} />}
      {currentPage === 'reviews' && (
        <GoogleReviews 
          user={user} 
          accessToken={accessToken}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          onNavigate={handleNavigate}
          selectedAccountId={selectedAccountId}
        />
      )}
      {currentPage === 'google-my-business' && (
        <GoogleMyBusinessPage 
          user={user} 
          accessToken={accessToken}
          selectedLocationId={selectedLocationId}
          setSelectedLocationId={setSelectedLocationId}
          onNavigate={handleNavigate}
          selectedAccountId={selectedAccountId}
        />
      )}
      {currentPage === 'responses' && (
        <div className="p-4 pt-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Réponses</h1>
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <p className="text-gray-600">Fonctionnalité en cours de développement</p>
            </div>
          </div>
        </div>
      )}
      {currentPage === 'avis-ia' && (
        <AISettingsPage user={user} />
      )}
      {currentPage === 'settings' && (
        <SettingsPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;