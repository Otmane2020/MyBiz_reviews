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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    console.log('🚀 Google OAuth function called')
    console.log('📝 Request method:', req.method)
    console.log('🔑 Environment check:', {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      clientIdLength: GOOGLE_CLIENT_ID?.length || 0
    })

    // Vérifier que les variables d'environnement sont configurées
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Missing Google OAuth credentials:', {
        hasClientId: !!GOOGLE_CLIENT_ID,
        hasClientSecret: !!GOOGLE_CLIENT_SECRET
      });
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Google OAuth manquante. Vérifiez les variables d\'environnement GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET.',
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

    let requestData;
    try {
      const requestText = await req.text()
      console.log('📨 Raw request body:', requestText)
      requestData = JSON.parse(requestText);
      console.log('📋 Parsed request data:', requestData)
    } catch (parseError) {
      console.error('❌ Failed to parse request JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Requête JSON invalide',
          success: false
        }),
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
    console.log('🎯 Action requested:', action)

    if (action === 'exchange-code') {
      console.log('🔄 Exchanging authorization code for tokens')
      const { code, redirectUri } = body

      if (!code || !redirectUri) {
        return new Response(
          JSON.stringify({ 
            error: 'Code et redirectUri requis',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

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
      console.log('🎫 Token response status:', tokenResponse.status)

      if (!tokenResponse.ok) {
        console.error('❌ Token exchange error:', tokens)
        return new Response(
          JSON.stringify({ 
            error: `Token exchange failed: ${tokens.error_description || tokens.error}`,
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      // Récupérer les informations utilisateur
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      })

      const userData = await userResponse.json()
      
      if (!userResponse.ok) {
        console.error('❌ User info error:', userData)
        return new Response(
          JSON.stringify({ 
            error: `Failed to get user info: ${userData.error_description || userData.error}`,
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      console.log('✅ OAuth exchange successful')
      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          user: userData,
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

    if (action === 'refresh-token') {
      console.log('🔄 Refreshing access token')
      const { refreshToken } = body

      if (!refreshToken) {
        return new Response(
          JSON.stringify({ 
            error: 'Refresh token requis',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

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
        console.error('❌ Token refresh error:', tokens)
        return new Response(
          JSON.stringify({ 
            error: `Token refresh failed: ${tokens.error_description || tokens.error}`,
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      console.log('✅ Token refresh successful')
      return new Response(
        JSON.stringify({
          access_token: tokens.access_token,
          expires_in: tokens.expires_in,
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

    if (action === 'get-accounts') {
      console.log('🏢 Getting Google My Business accounts')
      const { accessToken } = body

      if (!accessToken) {
        return new Response(
          JSON.stringify({ 
            error: 'Access token requis',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      console.log('🔍 Calling Google My Business API for accounts...')
      console.log('🔑 Using access token:', accessToken.substring(0, 20) + '...')
      
      const accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Accounts API response status:', accountsResponse.status)
      console.log('📡 Accounts API response headers:', Object.fromEntries(accountsResponse.headers.entries()))
      
      const accountsData = await accountsResponse.json()
      console.log('📊 Accounts API response data:', JSON.stringify(accountsData, null, 2))
      
      if (!accountsResponse.ok) {
        console.error('❌ Accounts API error:', accountsData)
        
        let errorMessage = 'Erreur inconnue'
        if (accountsData.error) {
          if (accountsData.error.code === 401) {
            errorMessage = 'Token d\'accès expiré ou invalide'
          } else if (accountsData.error.code === 403) {
            errorMessage = 'Accès refusé. Vérifiez que l\'API Google My Business est activée'
          } else if (accountsData.error.code === 404) {
            errorMessage = 'Aucun compte Google My Business trouvé'
          } else {
            errorMessage = accountsData.error.message || `Erreur ${accountsData.error.code}`
          }
        }
        
        return new Response(
          JSON.stringify({
            error: {
              message: errorMessage,
              code: accountsData.error?.code || accountsResponse.status,
              details: accountsData.error
            },
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

      console.log('✅ Accounts retrieved successfully')
      return new Response(
        JSON.stringify({
          accounts: accountsData.accounts || [],
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
      console.log('🏪 Getting locations for account')
      const { accessToken, accountId } = body

      if (!accessToken || !accountId) {
        return new Response(
          JSON.stringify({ 
            error: 'Access token et account ID requis',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      console.log('🏪 Getting locations for account:', accountId)
      console.log('🔑 Using access token:', accessToken.substring(0, 20) + '...')
      
      const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Locations API response status:', locationsResponse.status)
      console.log('📡 Locations API response headers:', Object.fromEntries(locationsResponse.headers.entries()))
      
      const locationsData = await locationsResponse.json()
      console.log('🏢 Locations API response data:', JSON.stringify(locationsData, null, 2))
      
      if (!locationsResponse.ok) {
        console.error('❌ Locations API error:', locationsData)
        
        let errorMessage = 'Erreur inconnue'
        if (locationsData.error) {
          if (locationsData.error.code === 401) {
            errorMessage = 'Token d\'accès expiré ou invalide'
          } else if (locationsData.error.code === 403) {
            errorMessage = 'Accès refusé aux établissements'
          } else if (locationsData.error.code === 404) {
            errorMessage = 'Aucun établissement trouvé pour ce compte'
          } else {
            errorMessage = locationsData.error.message || `Erreur ${locationsData.error.code}`
          }
        }
        
        return new Response(
          JSON.stringify({
            error: {
              message: errorMessage,
              code: locationsData.error?.code || locationsResponse.status,
              details: locationsData.error
            },
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

      console.log('✅ Locations retrieved successfully')
      return new Response(
        JSON.stringify({
          locations: locationsData.locations || [],
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
      console.log('⭐ Getting reviews for location')
      const { accessToken, locationId } = body

      if (!accessToken || !locationId) {
        return new Response(
          JSON.stringify({ 
            error: 'Access token et location ID requis',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      const reviewsResponse = await fetch(
        `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const reviewsData = await reviewsResponse.json()
      console.log('⭐ Reviews API response:', reviewsData)

      if (!reviewsResponse.ok) {
        console.error('❌ Reviews API error:', reviewsData)
        return new Response(
          JSON.stringify({
            error: reviewsData.error || { message: `HTTP ${reviewsResponse.status}` },
            success: false
          }),
          {
            status: reviewsResponse.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      return new Response(
        JSON.stringify({
          reviews: reviewsData.reviews || [],
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

    if (action === 'reply-review') {
      console.log('💬 Replying to review')
      const { accessToken, locationId, reviewId, comment } = body

      if (!accessToken || !locationId || !reviewId || !comment) {
        return new Response(
          JSON.stringify({ 
            error: 'Tous les paramètres sont requis: accessToken, locationId, reviewId, comment',
            success: false
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

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
      console.log('💬 Reply API response:', replyData)

      if (!replyResponse.ok) {
        console.error('❌ Reply API error:', replyData)
        return new Response(
          JSON.stringify({
            error: replyData.error || { message: `HTTP ${replyResponse.status}` },
            success: false
          }),
          {
            status: replyResponse.status,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders,
            },
          }
        )
      }

      return new Response(
        JSON.stringify({
          reply: replyData,
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

    // Action non supportée
    console.log('❌ Unsupported action:', action)
    return new Response(
      JSON.stringify({ 
        error: `Action non supportée: ${action}`,
        success: false
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('💥 Unexpected error in google-oauth function:', error)
    
    // S'assurer que la réponse est toujours en JSON
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        success: false,
        stack: error.stack
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