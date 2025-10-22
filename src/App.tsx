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
import AITestPage from './pages/AITestPage';
import AIReplyHistory from './pages/AIReplyHistory';
import EtablissementsPage from './pages/EtablissementsPage';

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
  const isAITestRoute = window.location.pathname === '/aitest';
  const isAIHistoryRoute = window.location.pathname === '/aihistory';

  // Function to save Google OAuth tokens to database
  const saveGoogleTokensToDatabase = async (userId: string, providerToken: string, providerRefreshToken?: string) => {
    try {
      if (!providerToken) return;

      const accountId = `google_${userId}`;
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      const { error } = await supabase
        .from('google_accounts')
        .upsert({
          user_id: userId,
          account_id: accountId,
          account_name: 'Google Account',
          access_token: providerToken,
          refresh_token: providerRefreshToken || null,
          token_expires_at: expiresAt,
          scopes: ['https://www.googleapis.com/auth/business.manage']
        }, {
          onConflict: 'user_id,account_id'
        });

      if (error) {
        console.error('❌ Error saving Google tokens to database:', error);
      } else {
        console.log('✅ Google OAuth tokens saved to database');
      }
    } catch (error) {
      console.error('❌ Exception saving Google tokens:', error);
    }
  };

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
      let refreshToken = '';

      if (session.provider_token) {
        token = session.provider_token;
        localStorage.setItem('accessToken', token);
        console.log('✅ Stored provider_token from session:', token.substring(0, 20) + '...');

        if (session.provider_refresh_token) {
          refreshToken = session.provider_refresh_token;
          localStorage.setItem('refreshToken', refreshToken);
        }

        saveGoogleTokensToDatabase(session.user.id, token, refreshToken);
      } else {
        token = localStorage.getItem('accessToken') || '';
        refreshToken = localStorage.getItem('refreshToken') || '';
        console.log('📦 Retrieved token from localStorage:', token ? token.substring(0, 20) + '...' : 'none');
      }
      setAccessToken(token);

      // Load saved account and location IDs
      const savedAccountId = localStorage.getItem('selectedAccountId');
      const savedLocationId = localStorage.getItem('selectedLocationId');
      if (savedAccountId) setSelectedAccountId(savedAccountId);
      if (savedLocationId) setSelectedLocationId(savedLocationId);

      // Check trial signup flag and onboarding status
      const isTrialSignup = localStorage.getItem('isTrialSignup') === 'true';
      const isDirectOnboarding = localStorage.getItem('directOnboarding') === 'true';
      const completedOnboarding = localStorage.getItem('onboardingCompleted');

     // Clear the trial signup flags after reading them
     localStorage.removeItem('isTrialSignup');
     localStorage.removeItem('directOnboarding');

     // Priority 1: If user clicked "Essayer gratuitement", always go to onboarding
     if (isTrialSignup || isDirectOnboarding) {
       setCurrentView('onboarding');
     }
     // Priority 2: If user has completed onboarding, go directly to dashboard
     else if (completedOnboarding === 'true') {
       setHasCompletedOnboarding(true);
       setCurrentView('app');
     }
     // Priority 3: New users without onboarding go to onboarding
     else {
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
      localStorage.removeItem('directOnboarding');
      setCurrentView('landing');
    }
  };
  // Initialize Supabase auth state listener
  useEffect(() => {
    // Extract tokens from URL hash if present (OAuth callback)
    const extractTokensFromHash = async () => {
      const hash = window.location.hash;
      if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const providerToken = params.get('provider_token');
        const providerRefreshToken = params.get('provider_refresh_token');

        if (providerToken) {
          console.log('🔍 Found provider_token in URL hash');
          localStorage.setItem('accessToken', providerToken);
          setAccessToken(providerToken);

          if (providerRefreshToken) {
            console.log('🔍 Found provider_refresh_token in URL hash');
            localStorage.setItem('refreshToken', providerRefreshToken);
          }

          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id) {
            await saveGoogleTokensToDatabase(session.user.id, providerToken, providerRefreshToken || undefined);
          }
        }
      }
    };

    extractTokensFromHash();

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
      setAccessToken('');
      localStorage.removeItem('accessToken');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          scopes: 'https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
        }
      });

      if (error) {
        setCurrentView('auth');
      }
    } catch (error) {
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

  if (isAITestRoute) {
    return <AITestPage />;
  }

  if (isAIHistoryRoute) {
    return <AIReplyHistory user={user} />;
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
    return <AuthPage />;
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
      {currentPage === 'etablissements' && (
        <EtablissementsPage user={user} onNavigate={handleNavigate} />
      )}
      {currentPage === 'settings' && (
        <SettingsPage user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;