import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

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
    
    // Get environment variables
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
    
    console.log('🔑 Environment check:', {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET
    })

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Missing Google OAuth credentials')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Google OAuth manquante',
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

    // Parse request body
    const requestData = await req.json()
    const { action } = requestData
    
    console.log('🎯 Action requested:', action)

    // --- get-auth-url ---
    if (action === 'get-auth-url') {
      const { redirectUri } = requestData

      if (!redirectUri) {
        return new Response(
          JSON.stringify({
            error: 'redirectUri requis',
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

      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/business.manage'
      ].join(' ')

      const url = `https://accounts.google.com/o/oauth2/v2/auth?` +
        new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: scopes,
          access_type: 'offline',
          prompt: 'consent'
        })

      return new Response(
        JSON.stringify({
          authUrl: url,
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

    // --- exchange-code ---
    if (action === 'exchange-code') {
      const { code, redirectUri } = requestData

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

      console.log('🔄 Exchanging code for tokens')

      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
      })

      const tokens = await tokenResponse.json()

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

      // Get user info
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
            error: `Failed to get user info: ${userData.error}`,
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

    // --- get-accounts ---
    if (action === 'get-accounts') {
      const { accessToken } = requestData

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

      console.log('🏢 Getting Google My Business accounts')
      
      const accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!accountsResponse.ok) {
        let errorData
        try {
          errorData = await accountsResponse.json()
        } catch (e) {
          errorData = { message: await accountsResponse.text(), code: accountsResponse.status }
        }
        console.error('❌ Accounts API error:', errorData)

        let errorMessage = 'Erreur inconnue'
        if (errorData.error) {
          if (errorData.error.code === 401) {
            errorMessage = 'Token d\'accès expiré ou invalide'
          } else if (errorData.error.code === 403) {
            errorMessage = 'Accès refusé. Vérifiez que l\'API Google My Business est activée'
          } else if (errorData.error.code === 404) {
            errorMessage = 'Aucun compte Google My Business trouvé'
          } else {
            errorMessage = errorData.error.message || `Erreur ${errorData.error.code}`
          }
        } else if (errorData.message) {
            errorMessage = `Erreur HTTP ${errorData.code}: ${errorData.message.substring(0, 100)}...`
        }

        return new Response(
          JSON.stringify({
            error: {
              message: errorMessage,
              code: errorData.error?.code || accountsResponse.status
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

      const accountsData = await accountsResponse.json()

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

    // --- get-locations ---
    if (action === 'get-locations') {
      const { accessToken, accountId } = requestData

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
      
      const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!locationsResponse.ok) {
        let errorData
        try {
          errorData = await locationsResponse.json()
        } catch (e) {
          errorData = { message: await locationsResponse.text(), code: locationsResponse.status }
        }
        console.error('❌ Locations API error:', errorData)

        let errorMessage = 'Erreur inconnue'
        if (errorData.error) {
          if (errorData.error.code === 401) {
            errorMessage = 'Token d\'accès expiré ou invalide'
          } else if (errorData.error.code === 403) {
            errorMessage = 'Accès refusé aux établissements'
          } else if (errorData.error.code === 404) {
            errorMessage = 'Aucun établissement trouvé pour ce compte'
          } else {
            errorMessage = errorData.error.message || `Erreur ${errorData.error.code}`
          }
        } else if (errorData.message) {
            errorMessage = `Erreur HTTP ${errorData.code}: ${errorData.message.substring(0, 100)}...`
        }

        return new Response(
          JSON.stringify({
            error: {
              message: errorMessage,
              code: errorData.error?.code || locationsResponse.status
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

      const locationsData = await locationsResponse.json()

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

    // Action non supportée
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
    console.error('💥 Unexpected error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
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