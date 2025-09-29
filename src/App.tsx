import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import SettingsPage from './components/SettingsPage';
import AISettingsPage from './components/AISettingsPage';
import GoogleReviews from './pages/GoogleReviews';
import SuperAdmin from './pages/SuperAdmin';
import SuccessPage from './pages/SuccessPage';
import NotificationCenter from './components/NotificationCenter';
import NotificationToast from './components/NotificationToast';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize notifications hook
  const { notifications, markAsRead, clearAll } = useReviewsNotifications(user?.id);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
        handleOAuthCallback();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setProfile(null);
        setCurrentPage('landing');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setCurrentPage('dashboard');
      } else {
        // No profile exists, show onboarding
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleOAuthCallback = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');

      if (code && state) {
        console.log('🔄 Processing OAuth callback...');
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Process the OAuth callback
        const response = await fetch(`${supabaseUrl}/functions/v1/auth-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            action: 'exchange-code',
            code: code,
            redirectUri: window.location.origin
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ OAuth callback processed successfully');
          // The auth state change will be handled by the listener
        } else {
          console.error('❌ OAuth callback failed:', result.error);
        }
      }
    } catch (error) {
      console.error('💥 App.tsx - Error processing OAuth callback:', error);
    }
  };

  const handleOnboardingComplete = (profileData) => {
    setProfile(profileData);
    setShowOnboarding(false);
    setCurrentPage('dashboard');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentPage('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Show onboarding if user is authenticated but has no profile
  if (user && showOnboarding) {
    return (
      <ComprehensiveOnboarding 
        user={user} 
        onComplete={handleOnboardingComplete}
      />
    );
  }

  // Show auth page if no user
  if (!user) {
    if (currentPage === 'auth') {
      return <AuthPage onBack={() => setCurrentPage('landing')} />;
    }
    return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
  }

  // Show success page for Stripe success
  if (currentPage === 'success') {
    return <SuccessPage onContinue={() => setCurrentPage('dashboard')} />;
  }

  // Main app navigation for authenticated users
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user}
            profile={profile}
            onNavigate={setCurrentPage}
            onSignOut={handleSignOut}
            onShowNotifications={() => setShowNotifications(true)}
            notificationCount={notifications.filter(n => !n.read).length}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            user={user}
            profile={profile}
            onBack={() => setCurrentPage('dashboard')}
            onProfileUpdate={setProfile}
          />
        );
      case 'ai-settings':
        return (
          <AISettingsPage 
            user={user}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      case 'google-reviews':
        return (
          <GoogleReviews 
            user={user}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      case 'super-admin':
        return (
          <SuperAdmin 
            user={user}
            onBack={() => setCurrentPage('dashboard')}
          />
        );
      default:
        return (
          <Dashboard 
            user={user}
            profile={profile}
            onNavigate={setCurrentPage}
            onSignOut={handleSignOut}
            onShowNotifications={() => setShowNotifications(true)}
            notificationCount={notifications.filter(n => !n.read).length}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
      
      {/* Notification Center */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onClearAll={clearAll}
      />

      {/* Notification Toasts */}
      <NotificationToast notifications={notifications} />
    </div>
  );
}