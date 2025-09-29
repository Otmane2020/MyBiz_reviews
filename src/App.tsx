import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import SettingsPage from './components/SettingsPage';
import GoogleReviews from './pages/GoogleReviews';
import SuperAdmin from './pages/SuperAdmin';
import SuccessPage from './pages/SuccessPage';
import ComprehensiveOnboarding from './components/ComprehensiveOnboarding';
import NotificationCenter from './components/NotificationCenter';
import NotificationToast from './components/NotificationToast';
import { useReviewsNotifications } from './hooks/useReviewsNotifications';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  // Initialize notifications hook
  useReviewsNotifications();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setCurrentPage('landing');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = localStorage.getItem('google_oauth_state');

      if (code && state && storedState && state === storedState) {
        try {
          // Clean up the stored state
          localStorage.removeItem('google_oauth_state');
          
          // Clear URL parameters
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Show success notification
          setNotification({
            message: 'Connexion Google réussie !',
            type: 'success'
          });
          
          // Navigate to dashboard or onboarding
          if (profile?.level === 1) {
            setShowOnboarding(true);
          } else {
            setCurrentPage('dashboard');
          }
        } catch (error) {
          console.error('OAuth callback error:', error);
          setNotification({
            message: 'Erreur lors de la connexion Google',
            type: 'error'
          });
        }
      } else if (code && (!state || !storedState || state !== storedState)) {
        // State validation failed
        localStorage.removeItem('google_oauth_state');
        window.history.replaceState({}, document.title, window.location.pathname);
        setNotification({
          message: 'Erreur de sécurité lors de la connexion. Veuillez réessayer.',
          type: 'error'
        });
      }
    };

    handleOAuthCallback();
  }, [profile]);

  const loadProfile = async (userId: string) => {
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
        if (data.level === 1) {
          setShowOnboarding(true);
        } else {
          setCurrentPage('dashboard');
        }
      } else {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || user?.email || '',
              avatar_url: user?.user_metadata?.avatar_url || null,
              level: 1,
              total_points: 0,
              current_streak: 0
            }
          ])
          .select()
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
        } else {
          setProfile(newProfile);
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setCurrentPage('dashboard');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    if (currentPage === 'auth') {
      return <AuthPage onBack={() => setCurrentPage('landing')} />;
    }
    return <LandingPage onGetStarted={() => setCurrentPage('auth')} />;
  }

  if (showOnboarding) {
    return (
      <ComprehensiveOnboarding
        user={user}
        profile={profile}
        onComplete={handleOnboardingComplete}
        onNotification={showNotification}
      />
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            profile={profile}
            onNavigate={setCurrentPage}
            onNotification={showNotification}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            user={user}
            profile={profile}
            onBack={() => setCurrentPage('dashboard')}
            onNotification={showNotification}
          />
        );
      case 'google-reviews':
        return (
          <GoogleReviews
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onNotification={showNotification}
          />
        );
      case 'super-admin':
        return (
          <SuperAdmin
            user={user}
            onBack={() => setCurrentPage('dashboard')}
            onNotification={showNotification}
          />
        );
      case 'success':
        return (
          <SuccessPage
            onContinue={() => setCurrentPage('dashboard')}
          />
        );
      default:
        return (
          <Dashboard
            user={user}
            profile={profile}
            onNavigate={setCurrentPage}
            onNotification={showNotification}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentPage()}
      <NotificationCenter />
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;