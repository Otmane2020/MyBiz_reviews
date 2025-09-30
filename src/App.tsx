import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import MobileMenu from './components/MobileMenu';
import GoogleReviews from './pages/GoogleReviews';
import GoogleMyBusinessPage from './pages/GoogleMyBusinessPage';
import AISettingsPage from './components/AISettingsPage';
import SettingsPage from './components/SettingsPage';
import SuperAdmin from './pages/SuperAdmin';
import SuccessPage from './pages/SuccessPage';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import GoogleBusinessSetup from './components/GoogleBusinessSetup';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';
import NotificationToast from './components/NotificationToast';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [accessToken, setAccessToken] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [isReturningFromOAuth, setIsReturningFromOAuth] = useState(false);

  // Notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useReviewsNotifications(selectedLocationId);
  const [activeNotification, setActiveNotification] = useState<any>(null);

  useEffect(() => {
    // Check for OAuth return parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('error') || urlParams.has('state');
    
    if (hasOAuthParams) {
      setIsReturningFromOAuth(true);
      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          picture: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || '')}&background=4285F4&color=fff`,
          authMethod: 'google'
        };
        setUser(userData);
        setAccessToken(session.provider_token || '');
        
        // Check if user needs onboarding
        const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
      }
      setLoading(false);
      setIsReturningFromOAuth(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          email: session.user.email,
          picture: session.user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.email || '')}&background=4285F4&color=fff`,
          authMethod: 'google'
        };
        
        setUser(userData);
        setAccessToken(session.provider_token || '');
        setShowAuth(false);
        setIsReturningFromOAuth(false);
        
        // Check if user needs onboarding
        const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        }
        
        // Clean URL after successful auth
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setAccessToken('');
        setShowAuth(false);
        setShowOnboarding(false);
        setShowGoogleSetup(false);
        localStorage.removeItem('onboardingCompleted');
        localStorage.removeItem('selectedStores');
        localStorage.removeItem('selectedPlan');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show new notification toasts
  useEffect(() => {
    const latestNotification = notifications.find(n => !n.read);
    if (latestNotification && latestNotification.id !== activeNotification?.id) {
      setActiveNotification(latestNotification);
    }
  }, [notifications, activeNotification]);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleGoogleAuth = (userData: any, token: string) => {
    setUser(userData);
    setAccessToken(token);
    setShowAuth(false);
    
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleEmailAuth = (userData: any) => {
    setUser(userData);
    setShowAuth(false);
    
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  };

  const handleOnboardingComplete = (selectedStores: string[], selectedPlan: string) => {
    localStorage.setItem('onboardingCompleted', 'true');
    localStorage.setItem('selectedStores', JSON.stringify(selectedStores));
    localStorage.setItem('selectedPlan', selectedPlan);
    
    if (selectedStores.length > 0) {
      setSelectedLocationId(selectedStores[0]);
    }
    
    setShowOnboarding(false);
  };

  const handleGoogleSetupComplete = (accountId: string, locationId: string) => {
    setSelectedAccountId(accountId);
    setSelectedLocationId(locationId);
    setShowGoogleSetup(false);
  };

  const handleTokenExpired = () => {
    setAccessToken('');
    setShowAuth(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const closeNotification = () => {
    setActiveNotification(null);
  };

  // Loading state
  if (loading || isReturningFromOAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white text-xl">
            {isReturningFromOAuth ? 'Finalisation de la connexion...' : 'Chargement...'}
          </div>
        </div>
      </div>
    );
  }

  // Show success page if URL contains success
  if (window.location.pathname === '/success') {
    return <SuccessPage />;
  }

  // Show super admin page
  if (window.location.pathname === '/superadmin') {
    return <SuperAdmin />;
  }

  // Show Google Business Setup if needed
  if (showGoogleSetup && accessToken) {
    return (
      <GoogleBusinessSetup
        accessToken={accessToken}
        onSetupComplete={handleGoogleSetupComplete}
        onTokenExpired={handleTokenExpired}
      />
    );
  }

  // Show onboarding for new users
  if (showOnboarding && user) {
    return (
      <ComprehensiveOnboarding
        user={user}
        accessToken={accessToken}
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show auth page
  if (showAuth) {
    return (
      <AuthPage
        onGoogleAuth={handleGoogleAuth}
        onEmailAuth={handleEmailAuth}
      />
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Main app content for authenticated users
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'reviews':
        return (
          <GoogleReviews
            user={user}
            accessToken={accessToken}
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={setSelectedLocationId}
            selectedAccountId={selectedAccountId}
            onNavigate={handleNavigate}
          />
        );
      case 'google-my-business':
        return (
          <GoogleMyBusinessPage
            user={user}
            accessToken={accessToken}
            selectedLocationId={selectedLocationId}
            setSelectedLocationId={setSelectedLocationId}
            selectedAccountId={selectedAccountId}
            onNavigate={handleNavigate}
          />
        );
      case 'avis-ia':
        return <AISettingsPage user={user} />;
      case 'settings':
        return <SettingsPage user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} />;
    }
  };

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
      
      {renderCurrentPage()}

      {/* Notification Toast */}
      {activeNotification && (
        <NotificationToast
          notification={activeNotification}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}

export default App;