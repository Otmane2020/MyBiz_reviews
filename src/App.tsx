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
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShowAuth(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleAuth = (userData: User, token: string) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleEmailAuth = (userData: User) => {
    setUser(userData);
    setShowAuth(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setShowAuth(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  if (showAuth) {
    return (
      <AuthPage 
        onGoogleAuth={handleGoogleAuth}
        onEmailAuth={handleEmailAuth}
      />
    );
  }

  if (user) {
    return (
      <Dashboard 
        user={user}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <LandingPage 
      onGetStarted={() => setShowAuth(true)}
    />
  );
}

export default App;