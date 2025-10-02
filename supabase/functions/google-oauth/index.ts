import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};
// Récupérer les identifiants depuis les variables d'environnement
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }
  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Google credentials not configured');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()));
      throw new Error('Google credentials not configured in environment variables');
    }

    console.log('✅ Google credentials found');
    const { action, accessToken, locationId, accountId, code, redirectUri, refreshToken, reviewId, comment } = await req.json();
    console.log(`🔄 Processing action: ${action}`);
    switch(action){
      case 'exchange-code':
        {
          if (!code || !redirectUri) {
            throw new Error('Code and redirectUri are required for exchange-code action');
          }
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              code,
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code'
            })
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) {
            throw new Error(`Google Token Exchange Error: ${tokenData.error_description || tokenData.error}`);
          }
          const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`
            }
          });
          const userInfo = await userInfoResponse.json();
          return new Response(JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            user: {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture
            }
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      case 'refresh-token':
        {
          if (!refreshToken) throw new Error('Refresh token is required');
          const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
              client_id: GOOGLE_CLIENT_ID,
              client_secret: GOOGLE_CLIENT_SECRET,
              refresh_token: refreshToken,
              grant_type: 'refresh_token'
            })
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok) {
            throw new Error(`Google Token Refresh Error: ${tokenData.error_description || tokenData.error}`);
          }
          return new Response(JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      case 'get-accounts':
        {
          if (!accessToken) throw new Error('Access token is required for get-accounts action');

          console.log('📡 Fetching accounts from Google Business Profile API...');
          console.log('🔑 Access token:', accessToken.substring(0, 20) + '...');

          const accountsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📥 Accounts API response status:', accountsResponse.status);

          const accountsData = await accountsResponse.json();
          console.log('📦 Accounts API response data:', JSON.stringify(accountsData, null, 2));

          if (!accountsResponse.ok) {
            const errorDetails = accountsData.error?.details || [];
            const errorMessage = accountsData.error?.message || 'Unknown error';
            console.error('❌ Google API Error:', errorMessage);
            console.error('Error details:', errorDetails);
            throw new Error(`Google API Error (${accountsResponse.status}): ${errorMessage}`);
          }

          console.log('✅ Successfully fetched accounts:', accountsData.accounts?.length || 0);

          return new Response(JSON.stringify({
            success: true,
            accounts: accountsData.accounts || []
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      case 'get-locations':
        {
          if (!accessToken || !accountId) throw new Error('Access token and accountId are required for get-locations action');

          console.log('📡 Fetching locations for account:', accountId);

          const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📥 Locations API response status:', locationsResponse.status);

          const locationsData = await locationsResponse.json();
          console.log('📦 Locations API response data:', JSON.stringify(locationsData, null, 2));

          if (!locationsResponse.ok) {
            const errorMessage = locationsData.error?.message || 'Unknown error';
            console.error('❌ Google API Error:', errorMessage);
            throw new Error(`Google API Error (${locationsResponse.status}): ${errorMessage}`);
          }

          console.log('✅ Successfully fetched locations:', locationsData.locations?.length || 0);

          return new Response(JSON.stringify({
            success: true,
            locations: locationsData.locations || []
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      case 'reply-review':
        {
          if (!accessToken || !locationId || !reviewId || !comment) {
            throw new Error('Access token, locationId, reviewId, and comment are required');
          }

          console.log('📡 Replying to review:', reviewId);

          const replyResponse = await fetch(`https://mybusiness.googleapis.com/v4/${locationId}/reviews/${reviewId}/reply`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              comment
            })
          });

          console.log('📥 Reply API response status:', replyResponse.status);

          const replyData = await replyResponse.json();

          if (!replyResponse.ok) {
            const errorMessage = replyData.error?.message || 'Unknown error';
            console.error('❌ Google API Error:', errorMessage);
            throw new Error(`Google API Error (${replyResponse.status}): ${errorMessage}`);
          }

          console.log('✅ Successfully replied to review');

          return new Response(JSON.stringify({
            success: true,
            reply: replyData
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error('❌ Error in google-oauth function:', error);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      details: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});