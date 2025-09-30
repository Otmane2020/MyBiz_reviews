import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

// Récupérer les identifiants depuis les variables d'environnement
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY');

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_API_KEY) {
      console.error('Google credentials not configured');
      throw new Error('Google credentials not configured in environment variables');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    // Note: Le client Supabase n'est pas utilisé dans les actions actuelles, mais il est conservé
    // pour de futures interactions avec la base de données (ex: stockage des tokens).
    // const supabase = createClient(supabaseUrl, supabaseServiceKey); 

    const { action, accessToken, locationId, accountId, code, redirectUri, refreshToken, reviewId, comment } = await req.json();
    console.log(`Processing action: ${action}`);

    switch (action) {
      case 'exchange-code':
        {
          if (!code || !redirectUri) {
            throw new Error('Code and redirectUri are required for exchange-code action');
          }
          console.log('Exchanging code for tokens...');
          
          // --- Échange de Code OAuth ---
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
            console.error('Token exchange failed:', tokenData);
            throw new Error(`Google Token Exchange Error: ${tokenData.error_description || tokenData.error}`);
          }
          
          // Fetch user info
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
          if (!refreshToken) {
            throw new Error('Refresh token is required for refresh-token action');
          }
          console.log('Refreshing access token...');

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
            console.error('Token refresh failed:', tokenData);
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
          if (!accessToken) {
            throw new Error('Access token is required for get-accounts action');
          }
          console.log('Fetching Google Business Profile accounts using v1 API...');
          console.log('Access token (first 20 chars):', accessToken.substring(0, 20) + '...');
          
          // NOUVEL ENDPOINT V1 (Account Management API)
          const accountsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts?key=${GOOGLE_API_KEY}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          console.log('Accounts API response status:', accountsResponse.status);
          
          const accountsData = await accountsResponse.json();
          console.log('Accounts API response data:', JSON.stringify(accountsData, null, 2));
          
          if (!accountsResponse.ok) {
            console.error('Get accounts failed:', accountsData);
            
            // Messages d'erreur plus détaillés
            if (accountsResponse.status === 403) {
              if (accountsData.error?.message?.includes('My Business Account Management API')) {
                throw new Error(`L'API "My Business Account Management API" n'est pas activée dans votre projet Google Cloud Console. Veuillez l'activer dans https://console.cloud.google.com/apis/library/mybusinessaccountmanagement.googleapis.com`);
              }
              if (accountsData.error?.message?.includes('insufficient permissions')) {
                throw new Error(`Permissions insuffisantes. Assurez-vous que votre token a le scope 'https://www.googleapis.com/auth/business.manage'`);
              }
              throw new Error(`Accès refusé (403): ${accountsData.error?.message || 'Vérifiez vos permissions et scopes OAuth'}`);
            }
            
            if (accountsResponse.status === 401) {
              throw new Error(`Token d'accès invalide ou expiré (401). Reconnectez-vous.`);
            }
            
            if (accountsResponse.status === 404) {
              throw new Error(`Endpoint non trouvé (404). L'API Google My Business a peut-être changé.`);
            }
            
            throw new Error(`Google API Error (${accountsResponse.status}): ${accountsData.error?.message || accountsData.error || 'Erreur inconnue'}`);
          }

          // La réponse doit contenir le nom de ressource complet (ex: accounts/123...)
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
          if (!accessToken || !accountId) {
            throw new Error('Access token and accountId are required for get-locations action');
          }
          // accountId doit être le nom de ressource complet (ex: accounts/123456789)
          console.log(`Fetching locations for account: ${accountId} using v1 API...`);

          // NOUVEL ENDPOINT V1 (Business Information API)
          const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?key=${GOOGLE_API_KEY}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          
          console.log('Locations API response status:', locationsResponse.status);
          
          const locationsData = await locationsResponse.json();
          console.log('Locations API response data:', JSON.stringify(locationsData, null, 2));
          
          if (!locationsResponse.ok) {
            console.error('Get locations failed:', locationsData);
            
            // Messages d'erreur plus détaillés pour les locations
            if (locationsResponse.status === 403) {
              if (locationsData.error?.message?.includes('My Business Business Information API')) {
                throw new Error(`L'API "My Business Business Information API" n'est pas activée. Activez-la sur https://console.cloud.google.com/apis/library/mybusinessbusinessinformation.googleapis.com`);
              }
              throw new Error(`Accès refusé aux locations (403): ${locationsData.error?.message || 'Vérifiez vos permissions'}`);
            }
            
            if (locationsResponse.status === 401) {
              throw new Error(`Token d'accès invalide pour les locations (401). Reconnectez-vous.`);
            }
            
            if (locationsResponse.status === 429) {
              throw new Error(`Limite de taux dépassée pour les locations (429). Veuillez patienter quelques minutes.`);
            }
            
            throw new Error(`Google API Error (locations - ${locationsResponse.status}): ${locationsData.error?.message || locationsData.error || 'Erreur inconnue'}`);
          }
          
          return new Response(JSON.stringify({
            success: true,
            // Les données sont maintenant dans locationsData.locations (pas .location)
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
            throw new Error('Access token, locationId, reviewId, and comment are required for reply-review action');
          }
          // locationId doit être le nom de ressource complet (ex: accounts/123/locations/456)
          console.log(`Replying to review: ${reviewId} using v4 API...`);

          // ENDPOINT V4 (Reviews API)
          const replyResponse = await fetch(`https://mybusiness.googleapis.com/v4/${locationId}/reviews/${reviewId}/replies?key=${GOOGLE_API_KEY}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              comment: comment
            })
          });
          
          const replyData = await replyResponse.json();
          if (!replyResponse.ok) {
            console.error('Reply to review failed:', replyData);
            throw new Error(`Google API Error (reply-review): ${replyData.error?.message || replyData.error || 'Unknown error'}`);
          }
          
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
    console.error('Error in google-oauth function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
});