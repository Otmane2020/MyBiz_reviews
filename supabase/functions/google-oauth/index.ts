import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
      console.error('Missing Google OAuth credentials:', {
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET
      });
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Google OAuth manquante. Vérifiez les variables d\'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.' 
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

    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Requête JSON invalide' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    const { action, ...body } = requestData;

    if (action === 'exchange-code') {
      // Échanger le code d'autorisation contre des tokens
      const { code, redirectUri } = body

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          scope: "https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        console.error('Token exchange error:', tokens)
        throw new Error(`Token exchange failed: ${tokens.error_description}`)
      }

      // Récupérer les informations utilisateur
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      const userData = await userResponse.json()
      
      if (!userResponse.ok) {
        console.error('User info error:', userData)
        throw new Error(`Failed to get user info: ${userData.error_description}`)
      }

      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          user: userData,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'refresh-token') {
      // Rafraîchir le token d'accès
      const { refreshToken } = body

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      })

      const tokens = await tokenResponse.json()

      if (!tokenResponse.ok) {
        throw new Error(`Token refresh failed: ${tokens.error_description}`)
      }

      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'get-accounts') {
      // Récupérer les comptes Google My Business
      const { accessToken } = body

      console.log('🔍 Getting accounts with token:', accessToken ? 'Present' : 'Missing')
      
      const accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log('📡 Accounts API response status:', accountsResponse.status)
      console.log('📡 Accounts API response headers:', Object.fromEntries(accountsResponse.headers.entries()))
      
      const accountsData = await accountsResponse.json()
      console.log('📊 Accounts API response data:', JSON.stringify(accountsData, null, 2))
      
      if (!accountsResponse.ok) {
        console.error('❌ Accounts API error:', accountsData)
        return new Response(
          JSON.stringify({
            error: accountsData.error || { message: `HTTP ${accountsResponse.status}: ${accountsResponse.statusText}` },
            success: false
          }),
          {
            status: accountsResponse.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      return new Response(
        JSON.stringify({
          ...accountsData,
          success: true
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'get-locations') {
      // Récupérer les établissements pour un compte
      const { accessToken, accountId } = body

      console.log('🏪 Getting locations for account:', accountId)
      console.log('🔑 Using token:', accessToken ? 'Present' : 'Missing')
      
      const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log('📡 Locations API response status:', locationsResponse.status)
      console.log('📡 Locations API response headers:', Object.fromEntries(locationsResponse.headers.entries()))
      
      const locationsData = await locationsResponse.json()
      console.log('🏢 Locations API response data:', JSON.stringify(locationsData, null, 2))
      
      if (!locationsResponse.ok) {
        console.error('❌ Locations API error:', locationsData)
        return new Response(
          JSON.stringify({
            error: locationsData.error || { message: `HTTP ${locationsResponse.status}: ${locationsResponse.statusText}` },
            success: false
          }),
          {
            status: locationsResponse.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      return new Response(
        JSON.stringify({
          ...locationsData,
          success: true
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'get-reviews') {
      // Récupérer les avis Google My Business
      const { accessToken, locationId } = body

      const reviewsResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      const reviewsData = await reviewsResponse.json()

      return new Response(
        JSON.stringify(reviewsData),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    if (action === 'reply-review') {
      // Répondre à un avis
      const { accessToken, locationId, reviewId, comment } = body

      const replyResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationId}/reviews/${reviewId}/reply`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment }),
        }
      )

      const replyData = await replyResponse.json()

      return new Response(
        JSON.stringify(replyData),
        {
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Action not supported' }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    // S'assurer que la réponse est toujours en JSON
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur inconnue',
        success: false 
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