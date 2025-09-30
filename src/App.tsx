import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
  authMethod: 'google' | 'email';
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check if we're returning from OAuth (has code or error in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const hasOAuthParams = urlParams.has('code') || urlParams.has('error') || urlParams.has('state');
    
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          picture: session.user.user_metadata?.avatar_url,
          authMethod: 'google'
        };
        setUser(userData);
      } else if (hasOAuthParams) {
        // If we have OAuth params but no session, show auth page
        setShowAuth(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            picture: session.user.user_metadata?.avatar_url,
            authMethod: 'google'
          };
          setUser(userData);
          setShowAuth(false);
          
          // Clean up URL after successful auth
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShowAuth(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleAuth = (userData: User, accessToken?: string) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleEmailAuth = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
  };

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  if (showAuth) {
    return (
      <AuthPage 
        onGoogleAuth={handleGoogleAuth}
        onEmailAuth={handleEmailAuth}
      />
    );
  }

  return <LandingPage onGetStarted={handleGetStarted} />;
}

export default App;