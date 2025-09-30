import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Onboarding from './components/Onboarding';
import MobileMenu from './components/MobileMenu';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import AISettingsPage from './components/AISettingsPage';
import SettingsPage from './components/SettingsPage';
import GoogleReviews from './pages/GoogleReviews';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  
  // Notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useReviewsNotifications(selectedLocationId);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');
      
      if (token && userParam) {
        try {
          const userData = JSON.parse(decodeURIComponent(userParam));
          setUser(userData);
          setAccessToken(token);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error parsing OAuth callback:', error);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('dashboard');
    setAccessToken('');
    setSelectedLocationId('');
    setSelectedAccountId('');
  };

  const handleOnboardingComplete = (selectedStores: string[], selectedPlan: string) => {
    setShowOnboarding(false);
    if (selectedStores.length > 0) {
      setSelectedLocationId(selectedStores[0]);
    }
    setCurrentPage('dashboard');
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showAuth) {
    return <AuthPage onBack={() => setShowAuth(false)} />;
  }

  if (showOnboarding) {
    return (
      <ComprehensiveOnboarding 
        user={user} 
        accessToken={accessToken}
        onComplete={handleOnboardingComplete} 
      />
    );
  }

  if (user) {
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
              onNavigate={setCurrentPage}
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
      <>
        <MobileMenu
          user={user}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onLogout={handleLogout}
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClearAll={clearNotifications}
        />
        {renderCurrentPage()}
      </>
    );
  }

  return (
    <LandingPage 
      onGetStarted={() => setShowAuth(true)}
    />
  );
}

export default App;