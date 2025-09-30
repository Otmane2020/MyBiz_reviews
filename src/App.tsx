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
  
  // Consolidated session handling function
  const handleSession = (session: any) => {
    if (session) {
      // Create user data from session
      const userData = {
        id: session.user.id,
        name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email,
        email: session.user.email,
        picture: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email)}&background=4285F4&color=fff`,
        authMethod: 'google'
      };
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set access token from session or localStorage
      let token = '';
      if (session.provider_token) {
        token = session.provider_token;
        localStorage.setItem('accessToken', token);
      } else {
        // Try to get from localStorage for restored sessions
        token = localStorage.getItem('accessToken') || '';
      }
      setAccessToken(token);
      
      // Load saved account and location IDs
      const savedAccountId = localStorage.getItem('selectedAccountId');
      const savedLocationId = localStorage.getItem('selectedLocationId');
      if (savedAccountId) setSelectedAccountId(savedAccountId);
      if (savedLocationId) setSelectedLocationId(savedLocationId);
      
      // Check onboarding status
      const completedOnboarding = localStorage.getItem('onboardingCompleted');
      if (completedOnboarding) {
        setHasCompletedOnboarding(true);
        setCurrentView('app');
      } else {
        // Si l'utilisateur n'a pas terminé l'onboarding, le diriger vers l'onboarding complet
        setCurrentView('onboarding');
      }
    } else {
      // No session - clear everything
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
  };
  // Initialize Supabase auth state listener
  useEffect(() => {
    // Check if returning from onboarding OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const isOnboardingReturn = urlParams.get('onboarding') === 'true';
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isOnboardingReturn && session) {
        // Clear the URL parameter
        window.history.replaceState({}, document.title, window.location.pathname);
        // Continue with onboarding
        setCurrentView('onboarding');
      }
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // If signing in during onboarding, stay in onboarding
        if (currentView === 'onboarding') {
          handleSession(session);
          return;
        }
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        handleSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);


  const handleGoogleAuth = () => {
    // Pour les utilisateurs existants - connexion Google directe
    try {
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
    }
  };

  const handleEmailAuth = (userData: any) => {
    // Cette fonction n'est plus utilisée car on a supprimé l'auth email
    console.log('Email auth deprecated');
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
    
    // Ensure user is logged in after onboarding
    if (!user) {
      // If no user session, redirect to auth
      setCurrentView('auth');
      return;
    }
    
    setCurrentView('app');
  };

  const handleGetStarted = () => {
    // Pour les nouveaux utilisateurs, aller directement à l'onboarding sans authentification
    setCurrentView('onboarding');
  };

  const handleGoogleTokenExpired = async () => {
    try {
      console.log('Token expired, initiating Google re-authentication...');
      
      // Clear expired token data
      setAccessToken('');
      localStorage.removeItem('accessToken');
      
      // Initiate Google OAuth sign-in with Supabase
      await supabase.auth.signInWithOAuth({
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
      console.error('Error during Google re-authentication:', error);
      // Fallback: redirect to auth page
      setCurrentView('auth');
    }
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
      <LandingPage 
        onGetStarted={handleGetStarted} 
        onNavigateToAuth={() => setCurrentView('auth')}
      />
    );
  }

  if (currentView === 'auth') {
    return (
      <AuthPage 
        onGoogleAuth={handleGoogleAuth}
        onEmailAuth={handleEmailAuth}
        onGetStarted={handleGetStarted}
      />
    );
  }


  if (currentView === 'onboarding') {
    return (
      <ComprehensiveOnboarding 
        user={user}
        accessToken={accessToken}
        onComplete={handleOnboardingCompleteWithData}
        onTokenExpired={handleGoogleTokenExpired}
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
          onTokenExpired={handleGoogleTokenExpired}
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