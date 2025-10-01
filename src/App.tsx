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
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CookiesPage from './pages/CookiesPage';
import GDPRPage from './pages/GDPRPage';

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

  // Check for legal pages routes
  const isPrivacyRoute = window.location.pathname === '/privacy';
  const isTermsRoute = window.location.pathname === '/terms';
  const isCookiesRoute = window.location.pathname === '/cookies';
  const isGDPRRoute = window.location.pathname === '/gdpr';

  // Consolidated session handling function
  const handleSession = (session: any) => {
    console.log('🔍 handleSession called with session:', !!session);
    console.log('📍 Current location:', window.location.pathname);
    
    if (session) {
      console.log('✅ Valid session found');
      console.log('👤 User ID:', session.user.id);
      console.log('📧 User email:', session.user.email);
      
      // Create user data from session
      const userData = {
        id: session.user.id,
        name: session.user.user_metadata.full_name || session.user.user_metadata.name || session.user.email,
        email: session.user.email,
        picture: session.user.user_metadata.avatar_url || session.user.user_metadata.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email)}&background=4285F4&color=fff`,
        authMethod: 'google'
      };
      
      console.log('👤 Created user data:', userData);
      
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set access token from session or localStorage
      let token = '';
      if (session.provider_token) {
        token = session.provider_token;
        localStorage.setItem('accessToken', token);
        console.log('🔑 Access token saved:', token ? 'Present' : 'Missing');
      } else {
        // Try to get from localStorage for restored sessions
        token = localStorage.getItem('accessToken') || '';
        console.log('🔑 Access token from localStorage:', token ? 'Present' : 'Missing');
      }
      setAccessToken(token);
      
      // Load saved account and location IDs
      const savedAccountId = localStorage.getItem('selectedAccountId');
      const savedLocationId = localStorage.getItem('selectedLocationId');
      console.log('🏢 Saved account ID:', savedAccountId);
      console.log('📍 Saved location ID:', savedLocationId);
      if (savedAccountId) setSelectedAccountId(savedAccountId);
      if (savedLocationId) setSelectedLocationId(savedLocationId);
      
      // Check trial signup flag and onboarding status
      const isTrialSignup = localStorage.getItem('isTrialSignup') === 'true';
      const isDirectOnboarding = localStorage.getItem('directOnboarding') === 'true';
      
      // Clear the trial signup flags immediately after reading them
      localStorage.removeItem('isTrialSignup');
      localStorage.removeItem('directOnboarding');
      console.log('🧹 Cleared isTrialSignup and directOnboarding from localStorage immediately');
      
      const completedOnboarding = localStorage.getItem('onboardingCompleted');
      const hasSelectedLocation = !!savedLocationId;
      
      console.log('🔍 Session handling - isTrialSignup:', isTrialSignup);
      console.log('🔍 Session handling - isDirectOnboarding:', isDirectOnboarding);
      console.log('🔍 Session handling - completedOnboarding:', completedOnboarding);
      console.log('🔍 Session handling - hasSelectedLocation:', hasSelectedLocation);
      console.log('📝 All localStorage keys:', Object.keys(localStorage));
      console.log('📝 localStorage onboardingCompleted value:', localStorage.getItem('onboardingCompleted'));
     
     // Priority 1: If user clicked "Essayer gratuitement", always go to onboarding
     if (isTrialSignup || isDirectOnboarding) {
       console.log('✅ Trial signup detected - redirecting to onboarding');
       console.log('🎯 Setting currentView to: onboarding');
       setCurrentView('onboarding');
     } 
     // Priority 2: If user has completed onboarding AND has selected location, go to dashboard
     else if (completedOnboarding === 'true' && hasSelectedLocation) {
       console.log('✅ Onboarding completed - redirecting to app dashboard');
       console.log('🎯 Setting currentView to: app');
       setHasCompletedOnboarding(true);
       setCurrentView('app');
     } 
     // Priority 3: Default fallback - users without complete setup go to onboarding
     else {
       console.log('✅ User needs to complete setup - redirecting to onboarding');
       console.log('🔍 Reason: completedOnboarding =', completedOnboarding, ', hasSelectedLocation =', hasSelectedLocation);
       console.log('🎯 Setting currentView to: onboarding');
       setCurrentView('onboarding');
     }
    } else {
      console.log('❌ No session found - user not authenticated');
      
      // No session - clear everything
      setUser(null);
      setAccessToken('');
      setSelectedAccountId('');
      setSelectedLocationId('');
      setCurrentPage('dashboard');
      setHasCompletedOnboarding(false);
      console.log('🧹 Clearing all user data from localStorage');
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('selectedAccountId');
      localStorage.removeItem('selectedLocationId');
      localStorage.removeItem('onboardingCompleted');
      localStorage.removeItem('isTrialSignup');
      localStorage.removeItem('directOnboarding');
      // Always redirect to landing page when not authenticated
      console.log('🎯 Setting currentView to: landing');
      setCurrentView('landing');
    }
  };
  // Initialize Supabase auth state listener
  useEffect(() => {
    console.log('🚀 Initializing Supabase auth state listener');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔍 Initial session check:', !!session);
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change event:', event);
      console.log('🔍 Session in auth change:', !!session);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('✅ User signed in or token refreshed');
        handleSession(session);
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ User signed out');
        handleSession(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleGoogleAuth = (userData: any, token: string) => {
    // Cette fonction n'est plus utilisée - l'OAuth est géré directement dans AuthPage
    // et la logique de redirection est dans handleSession
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
    // Use Supabase signOut for all users
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

  // Handle legal pages routes
  if (isPrivacyRoute) {
    return <PrivacyPage />;
  }
  
  if (isTermsRoute) {
    return <TermsPage />;
  }
  
  if (isCookiesRoute) {
    return <CookiesPage />;
  }
  
  if (isGDPRRoute) {
    return <GDPRPage />;
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

  // Handle app view - can be either mobile or desktop based on screen size
  if (currentView === 'app') {
    // Check if we're on a desktop screen (you can adjust this breakpoint)
    const isDesktop = window.innerWidth >= 1024;
    
    if (isDesktop) {
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