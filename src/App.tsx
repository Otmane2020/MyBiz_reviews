import React from 'react';
import { useState, useEffect } from 'react';
import SuperAdmin from './pages/SuperAdmin';
import AuthPage from './components/AuthPage';
import LandingPage from './components/LandingPage';
import GoogleBusinessSetup from './components/GoogleBusinessSetup';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import MobileMenu from './components/MobileMenu';
import Dashboard from './components/Dashboard';
import GoogleReviews from './pages/GoogleReviews';
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

  // Check if current path is /superadmin
  const isSuperAdminRoute = window.location.pathname === '/superadmin';
  
  // Check if current path is /success
  const isSuccessRoute = window.location.pathname === '/success';

  // Notifications hook
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useReviewsNotifications(selectedLocationId);

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const savedAccountId = localStorage.getItem('selectedAccountId');
    const savedLocationId = localStorage.getItem('selectedLocationId');

    if (savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedToken) setAccessToken(savedToken);
      if (savedAccountId) setSelectedAccountId(savedAccountId);
      if (savedLocationId) setSelectedLocationId(savedLocationId);
      setCurrentView('app');
    } else {
      // Show landing page for new users
      setCurrentView('landing');
    }
  }, []);

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
  }, []);

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
        alert(`Configuration Supabase manquante. URL: ${supabaseUrl || 'MISSING'}, Key: ${supabaseKey ? 'Present' : 'MISSING'}`);
        return;
      }
      
      if (supabaseUrl.includes('your-project-id')) {
        alert('ERREUR: Les variables d\'environnement ne sont pas configurées. Veuillez créer un fichier .env avec vos vraies valeurs Supabase.');
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
          redirectUri: window.location.origin + '/',
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.user && data.access_token) {
        console.log('OAuth success, setting user data');
        setUser(data.user);
        setAccessToken(data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('accessToken', data.access_token);
        setCurrentView('google-setup');
      } else {
        console.error('OAuth error:', data);
        alert(`Erreur lors de la connexion: ${data.error || 'Erreur inconnue'}`);
      }
    } catch (error) {
      console.error('Error processing OAuth callback:', error);
      alert(`Erreur lors de la connexion: ${error.message}`);
    }
  };

  // Check if we're in OAuth popup
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    // No longer using popups - all OAuth is handled via direct redirects
  }, []);

  const handleGoogleAuth = (userData: any, token: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
    setCurrentView('google-setup');
  };

  const handleEmailAuth = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('onboarding');
  };

  const handleGetStarted = () => {
    setCurrentView('auth');
  };

  const handleGoogleSetupComplete = (accountId: string, locationId: string) => {
    setSelectedAccountId(accountId);
    setSelectedLocationId(locationId);
    localStorage.setItem('selectedAccountId', accountId);
    localStorage.setItem('selectedLocationId', locationId);
    setCurrentView('onboarding');
  };

  const handleOnboardingComplete = () => {
    setCurrentView('app');
  };

  const handleOnboardingCompleteWithData = (selectedStores: string[], selectedPlan: string) => {
    // Save selected stores and plan
    localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
    localStorage.setItem('selectedPlan', selectedPlan);
    
    // Set the first selected store as the current location
    if (selectedStores.length > 0) {
      setSelectedLocationId(selectedStores[0]);
      localStorage.setItem('selectedLocationId', selectedStores[0]);
    }
    
    setCurrentView('app');
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken('');
    setSelectedAccountId('');
    setSelectedLocationId('');
    setCurrentPage('dashboard');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('selectedAccountId');
    localStorage.removeItem('selectedLocationId');
    setCurrentView('landing');
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