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
import DesktopDashboard from './components/DesktopDashboard';
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

  // Check if current path is /dashboard
  const isDashboardRoute = window.location.pathname === '/dashboard';
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
      
      // Check trial signup flag and onboarding status
      const isTrialSignup = localStorage.getItem('isTrialSignup') === 'true';
      const completedOnboarding = localStorage.getItem('onboardingCompleted');
      
      // Clear the trial signup flag after reading it
      localStorage.removeItem('isTrialSignup');
      
      if (isTrialSignup || (!completedOnboarding && !isDashboardRoute)) {
        // New trial user or user who hasn't completed onboarding
        setCurrentView('onboarding');
      } else if (completedOnboarding || isDashboardRoute) {
        // Existing user with completed onboarding or direct dashboard access
        setHasCompletedOnboarding(true);
        setCurrentView('app');
      } else {
        // Fallback to onboarding for safety
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
      localStorage.removeItem('isTrialSignup');
      // Si on est sur /dashboard, rediriger vers auth, sinon landing
      setCurrentView(isDashboardRoute ? 'auth' : 'landing');
    }
  };
  // Initialize Supabase auth state listener
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        handleSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleGoogleAuth = (userData: any, token: string) => {
    // This function is now called from AuthPage with isTrial flag
    // The actual OAuth is handled by Supabase in AuthPage
  };

  const handleEmailAuth = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('google-setup');
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

  const handleGetStarted = () => {
    setCurrentView('auth');
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

  // Handle Dashboard route - version desktop
  if (isDashboardRoute) {
    if (!user) {
      return (
        <AuthPage 
          onGoogleAuth={handleGoogleAuth}
          onEmailAuth={handleEmailAuth}
        />
      );
    }
    
    return (
      <DesktopDashboard 
        user={user}
        accessToken={accessToken}
        selectedLocationId={selectedLocationId}
        setSelectedLocationId={setSelectedLocationId}
        selectedAccountId={selectedAccountId}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onClearAll={clearNotifications}
        onTokenExpired={handleGoogleTokenExpired}
      />
    );
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
        onTokenExpired={handleGoogleTokenExpired}
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