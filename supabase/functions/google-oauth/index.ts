import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Récupérer les identifiants depuis les variables d'environnement
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('Google OAuth credentials not configured')
      throw new Error('Google OAuth credentials not configured in environment variables')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, accessToken, locationId, accountId, code, redirectUri, refreshToken, reviewId, comment } = await req.json()

    console.log(`Processing action: ${action}`)

    switch (action) {
      case 'exchange-code': {
        if (!code || !redirectUri) {
          throw new Error('Code and redirectUri are required for exchange-code action')
        }
        
        console.log('Exchanging code for tokens...')
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        })
        
        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) {
          console.error('Token exchange failed:', tokenData)
          throw new Error(`Google Token Exchange Error: ${tokenData.error_description || tokenData.error}`)
        }

        // Fetch user info
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        })
        const userInfo = await userInfoResponse.json()

        return new Response(
          JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            user: {
              id: userInfo.sub,
              email: userInfo.email,
              name: userInfo.name,
              picture: userInfo.picture,
            },
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      case 'refresh-token': {
        if (!refreshToken) {
          throw new Error('Refresh token is required for refresh-token action')
        }
        
        console.log('Refreshing access token...')
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID!,
            client_secret: GOOGLE_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
          }),
        })
        
        const tokenData = await tokenResponse.json()
        if (!tokenResponse.ok) {
          console.error('Token refresh failed:', tokenData)
          throw new Error(`Google Token Refresh Error: ${tokenData.error_description || tokenData.error}`)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            access_token: tokenData.access_token,
            expires_in: tokenData.expires_in,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      case 'get-accounts': {
        if (!accessToken) {
          throw new Error('Access token is required for get-accounts action')
        }
        
        console.log('Fetching Google My Business accounts...')
        const accountsResponse = await fetch(
          'https://mybusiness.googleapis.com/v4/accounts',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        
        const accountsData = await accountsResponse.json()
        if (!accountsResponse.ok) {
          console.error('Get accounts failed:', accountsData)
          throw new Error(`Google API Error (get-accounts): ${accountsData.error?.message || accountsData.error || 'Unknown error'}`)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            accounts: accountsData.accounts || [],
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      case 'get-locations': {
        if (!accessToken || !accountId) {
          throw new Error('Access token and accountId are required for get-locations action')
        }
        
        console.log(`Fetching locations for account: ${accountId}`)
        const locationsResponse = await fetch(
          `https://mybusiness.googleapis.com/v4/${accountId}/locations`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        
        const locationsData = await locationsResponse.json()
        if (!locationsResponse.ok) {
          console.error('Get locations failed:', locationsData)
          throw new Error(`Google API Error (get-locations): ${locationsData.error?.message || locationsData.error || 'Unknown error'}`)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            locations: locationsData.locations || [],
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      case 'reply-review': {
        if (!accessToken || !locationId || !reviewId || !comment) {
          throw new Error('Access token, locationId, reviewId, and comment are required for reply-review action')
        }
        
        console.log(`Replying to review: ${reviewId}`)
        const replyResponse = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationId}/reviews/${reviewId}/replies`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              comment: comment,
            }),
          }
        )
        
        const replyData = await replyResponse.json()
        if (!replyResponse.ok) {
          console.error('Reply to review failed:', replyData)
          throw new Error(`Google API Error (reply-review): ${replyData.error?.message || replyData.error || 'Unknown error'}`)
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            reply: replyData,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      default:
        throw new Error(`Unsupported action: ${action}`)
    }

  } catch (error) {
    console.error('Error in google-oauth function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})