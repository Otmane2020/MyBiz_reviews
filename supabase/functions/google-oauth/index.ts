import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
      throw new Error('Google credentials not configured in environment variables');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Supabase credentials not configured');
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (user && !userError) {
        userId = user.id;
        console.log('✅ Authenticated user:', userId);
      }
    }

    console.log('✅ Google credentials found');
    const requestBody = await req.json();
    const { action, accessToken, locationId, accountId, code, redirectUri, refreshToken, reviewId, comment } = requestBody;
    console.log(`🔄 Processing action: ${action}`);

    switch(action) {
      case 'store-tokens':
        {
          if (!userId) {
            throw new Error('User authentication required for store-tokens action');
          }

          const { accessToken: newAccessToken, refreshToken: newRefreshToken, accountId: newAccountId, accountName, expiresIn } = requestBody;

          if (!newAccessToken || !newAccountId) {
            throw new Error('Access token and account ID are required');
          }

          const tokenExpiresAt = new Date(Date.now() + (expiresIn || 3600) * 1000);

          const { data, error } = await supabase
            .from('google_accounts')
            .upsert({
              user_id: userId,
              account_id: newAccountId,
              account_name: accountName || null,
              access_token: newAccessToken,
              refresh_token: newRefreshToken || null,
              token_expires_at: tokenExpiresAt.toISOString(),
              scopes: ['https://www.googleapis.com/auth/business.manage'],
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,account_id'
            })
            .select()
            .single();

          if (error) {
            console.error('❌ Error storing tokens:', error);
            throw new Error(`Failed to store tokens: ${error.message}`);
          }

          console.log('✅ Tokens stored successfully for user:', userId);

          await supabase
            .from('clients')
            .upsert({
              id: userId,
              plan_type: 'starter',
              plan_status: 'trial',
              trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              max_locations: 1,
              updated_at: new Date().toISOString()
            }, {
              onConflict: 'id',
              ignoreDuplicates: false
            });

          return new Response(JSON.stringify({
            success: true,
            message: 'Tokens stored successfully'
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

      case 'get-stored-token':
        {
          if (!userId) {
            throw new Error('User authentication required for get-stored-token action');
          }

          const { data: googleAccount, error } = await supabase
            .from('google_accounts')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) {
            console.error('❌ Error fetching stored token:', error);
            throw new Error(`Failed to fetch stored token: ${error.message}`);
          }

          if (!googleAccount) {
            return new Response(JSON.stringify({
              success: false,
              error: 'No stored tokens found'
            }), {
              status: 404,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          const tokenExpiresAt = new Date(googleAccount.token_expires_at);
          const now = new Date();

          if (tokenExpiresAt <= now && googleAccount.refresh_token) {
            console.log('🔄 Token expired, refreshing...');

            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                refresh_token: googleAccount.refresh_token,
                grant_type: 'refresh_token'
              })
            });

            const tokenData = await tokenResponse.json();

            if (!tokenResponse.ok) {
              throw new Error(`Token refresh failed: ${tokenData.error_description || tokenData.error}`);
            }

            const newTokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

            await supabase
              .from('google_accounts')
              .update({
                access_token: tokenData.access_token,
                token_expires_at: newTokenExpiresAt.toISOString(),
                updated_at: new Date().toISOString()
              })
              .eq('id', googleAccount.id);

            return new Response(JSON.stringify({
              success: true,
              access_token: tokenData.access_token,
              account_id: googleAccount.account_id,
              expires_at: newTokenExpiresAt.toISOString()
            }), {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          return new Response(JSON.stringify({
            success: true,
            access_token: googleAccount.access_token,
            account_id: googleAccount.account_id,
            expires_at: googleAccount.token_expires_at
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

      case 'save-locations':
        {
          if (!userId) {
            throw new Error('User authentication required for save-locations action');
          }

          const { locations, googleAccountId } = requestBody;

          if (!locations || !Array.isArray(locations)) {
            throw new Error('Locations array is required');
          }

          const { data: client } = await supabase
            .from('clients')
            .select('max_locations')
            .eq('id', userId)
            .single();

          const maxLocations = client?.max_locations || 1;

          if (locations.length > maxLocations) {
            return new Response(JSON.stringify({
              success: false,
              error: `Plan limit exceeded. Your plan allows ${maxLocations} location(s).`
            }), {
              status: 403,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            });
          }

          const locationsToInsert = locations.map((loc: any) => ({
            user_id: userId,
            google_account_id: googleAccountId || null,
            location_id: loc.name,
            location_name: loc.title || loc.locationName || 'Unknown',
            address: loc.storefrontAddress?.addressLines?.join(', ') || loc.address || null,
            category: loc.categories?.[0]?.displayName || loc.primaryCategory?.displayName || null,
            is_active: true,
            updated_at: new Date().toISOString()
          }));

          const { error } = await supabase
            .from('locations')
            .upsert(locationsToInsert, {
              onConflict: 'user_id,location_id',
              ignoreDuplicates: false
            });

          if (error) {
            console.error('❌ Error saving locations:', error);
            throw new Error(`Failed to save locations: ${error.message}`);
          }

          console.log('✅ Locations saved successfully:', locations.length);

          return new Response(JSON.stringify({
            success: true,
            message: `${locations.length} location(s) saved successfully`
          }), {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders
            }
          });
        }

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

          const accountsResponse = await fetch(`https://mybusinessaccountmanagement.googleapis.com/v1/accounts`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          console.log('📥 Accounts API response status:', accountsResponse.status);

          const accountsData = await accountsResponse.json();

          if (!accountsResponse.ok) {
            const errorMessage = accountsData.error?.message || 'Unknown error';
            console.error('❌ Google API Error:', errorMessage);
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
