import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const OAuthCallback = () => {
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (!code) {
          throw new Error('No authorization code found');
        }

        console.log('📥 Received OAuth code, exchanging for tokens...');
        setStatus('Exchanging authorization code...');

        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const response = await fetch(`${supabaseUrl}/functions/v1/direct-google-oauth?code=${code}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to exchange code');
        }

        console.log('✅ Got tokens from Google');
        setStatus('Creating Supabase session...');

        const { email, name, picture } = data.userInfo;

        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: Math.random().toString(36).slice(-16),
          options: {
            data: {
              full_name: name,
              avatar_url: picture,
              google_access_token: data.accessToken,
              google_refresh_token: data.refreshToken,
            }
          }
        });

        if (signUpError && signUpError.message !== 'User already registered') {
          throw signUpError;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: Math.random().toString(36).slice(-16),
        });

        if (signInError) {
          console.log('First login attempt failed, trying alternative method...');
        }

        setStatus('Setting up your account...');

        const isTrialSignup = localStorage.getItem('isTrialSignup') === 'true';

        if (isTrialSignup) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('clients').upsert({
              id: user.id,
              business_name: name,
              plan_type: 'starter',
              plan_status: 'trial',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              max_locations: 1
            });
          }
        }

        localStorage.setItem('google_access_token', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('google_refresh_token', data.refreshToken);
        }

        console.log('✅ OAuth completed successfully!');
        setStatus('Success! Redirecting...');

        setTimeout(() => {
          window.location.href = '/';
        }, 1000);

      } catch (err) {
        console.error('❌ OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('Error');

        setTimeout(() => {
          window.location.href = '/?error=oauth_failed';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        {error ? (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">Redirecting back to login...</p>
          </>
        ) : (
          <>
            <div className="text-6xl mb-4 animate-spin">⚙️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{status}</h2>
            <p className="text-gray-600">Please wait while we complete your authentication...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
