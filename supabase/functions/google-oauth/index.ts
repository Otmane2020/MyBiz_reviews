import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri, accessToken, accountId } = await req.json();
    
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Missing Google OAuth credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Google OAuth credentials not configured' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    switch (action) {
      case 'exchange-code': {
        console.log('🔄 Starting OAuth code exchange...');
        console.log('📍 Redirect URI:', redirectUri);
        console.log('📏 Redirect URI length:', redirectUri?.length);
        console.log('🔗 Encoded redirect URI:', encodeURIComponent(redirectUri || ''));
        
        // Validate redirect URI
        if (!redirectUri?.startsWith('https://') && !redirectUri?.includes('localhost')) {
          console.warn('⚠️ Non-HTTPS redirect URI detected:', redirectUri);
        }
        
        if (redirectUri?.endsWith('/')) {
          console.info('ℹ️ Redirect URI has trailing slash');
        } else {
          console.info('ℹ️ Redirect URI has no trailing slash');
        }

        const tokenParams = new URLSearchParams({
          code: code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        });

        console.log('📤 Token exchange parameters:', {
          code: code?.substring(0, 10) + '...',
          client_id: GOOGLE_CLIENT_ID?.substring(0, 10) + '...',
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        });

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams.toString(),
        });

        const tokenData: GoogleTokenResponse = await tokenResponse.json();

        if (!tokenResponse.ok) {
          console.error('❌ Token exchange failed:', tokenData);
          
          let errorMessage = 'Token exchange failed';
          if (tokenData.error === 'redirect_uri_mismatch') {
            errorMessage = `Redirect URI mismatch. Please ensure "${redirectUri}" is configured in Google Cloud Console OAuth settings.`;
          } else if (tokenData.error === 'invalid_client') {
            errorMessage = 'Invalid client credentials. Check your Google Client ID and Secret.';
          } else if (tokenData.error === 'invalid_grant') {
            errorMessage = 'Authorization code expired or already used. Please try authenticating again.';
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: errorMessage,
              details: tokenData 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ Token exchange successful');

        // Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
          },
        });

        const userData: GoogleUserInfo = await userResponse.json();

        if (!userResponse.ok) {
          console.error('❌ Failed to fetch user info:', userData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch user information' 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ User info retrieved successfully');

        return new Response(
          JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            user: userData,
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'get-accounts': {
        console.log('📋 Fetching Google My Business accounts...');
        
        const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const accountsData = await accountsResponse.json();

        if (!accountsResponse.ok) {
          console.error('❌ Failed to fetch accounts:', accountsData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch Google My Business accounts',
              details: accountsData 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ Accounts retrieved successfully');

        return new Response(
          JSON.stringify({
            success: true,
            accounts: accountsData.accounts || [],
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'get-locations': {
        console.log('📍 Fetching locations for account:', accountId);
        
        const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        const locationsData = await locationsResponse.json();

        if (!locationsResponse.ok) {
          console.error('❌ Failed to fetch locations:', locationsData);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Failed to fetch locations',
              details: locationsData 
            }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('✅ Locations retrieved successfully');

        return new Response(
          JSON.stringify({
            success: true,
            locations: locationsData.locations || [],
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid action' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
    }
  } catch (error) {
    console.error('❌ Edge Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});