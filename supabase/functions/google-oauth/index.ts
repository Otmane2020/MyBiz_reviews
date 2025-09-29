import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://starlinko.pro",
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
    let requestData
    try {
      requestData = await req.json()
    } catch (error) {
      console.error('❌ Failed to parse request body:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
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

      let tokenResponse
      try {
        tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
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
      } catch (error) {
        console.error('❌ Token request failed:', error)
        return new Response(
          JSON.stringify({ 
            error: `Token request failed: ${error.message}`,
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

      let tokens
      try {
        tokens = await tokenResponse.json()
      } catch (error) {
        console.error('❌ Failed to parse token response:', error)
        return new Response(
          JSON.stringify({ 
            error: `Failed to parse token response: ${error.message}`,
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
      let userResponse
      try {
        userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })
      } catch (error) {
        console.error('❌ User info request failed:', error)
        return new Response(
          JSON.stringify({ 
            error: `User info request failed: ${error.message}`,
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

      let userData
      try {
        userData = await userResponse.json()
      } catch (error) {
        console.error('❌ Failed to parse user response:', error)
        return new Response(
          JSON.stringify({ 
            error: `Failed to parse user response: ${error.message}`,
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

      console.log('🏢 Getting Google Business Profile accounts')
      
      // Use the new Google Business Profile API
      let accountsResponse
      try {
        accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('❌ Accounts request failed:', error)
        return new Response(
          JSON.stringify({
            error: {
              message: `Accounts request failed: ${error.message}`,
              code: 500
            },
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

      if (!accountsResponse.ok) {
        let errorData
        try {
          const responseText = await accountsResponse.text()
          try {
            errorData = JSON.parse(responseText)
          } catch (parseError) {
            errorData = { message: responseText, code: accountsResponse.status }
          }
        } catch (e) {
          errorData = { message: 'Unable to read response', code: accountsResponse.status }
        }
        console.error('❌ Accounts API error:', errorData)

        let errorMessage = 'Erreur inconnue'
        if (errorData.error) {
          if (errorData.error.code === 401) {
            errorMessage = 'Token d\'accès expiré ou invalide'
          } else if (errorData.error.code === 403) {
            errorMessage = 'Accès refusé. Vérifiez que l\'API Google Business Profile est activée'
          } else if (errorData.error.code === 404) {
            errorMessage = 'Aucun compte Google Business Profile trouvé'
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

      let accountsData
      try {
        accountsData = await accountsResponse.json()
      } catch (error) {
        console.error('❌ Failed to parse accounts response:', error)
        return new Response(
          JSON.stringify({
            error: {
              message: `Failed to parse accounts response: ${error.message}`,
              code: 500
            },
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
      
      // Use the new Google Business Profile API for locations
      let locationsResponse
      try {
        locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
      } catch (error) {
        console.error('❌ Locations request failed:', error)
        return new Response(
          JSON.stringify({
            error: {
              message: `Locations request failed: ${error.message}`,
              code: 500
            },
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

      if (!locationsResponse.ok) {
        let errorData
        try {
          const responseText = await locationsResponse.text()
          try {
            errorData = JSON.parse(responseText)
          } catch (parseError) {
            errorData = { message: responseText, code: locationsResponse.status }
          }
        } catch (e) {
          errorData = { message: 'Unable to read response', code: locationsResponse.status }
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

      let locationsData
      try {
        locationsData = await locationsResponse.json()
      } catch (error) {
        console.error('❌ Failed to parse locations response:', error)
        return new Response(
          JSON.stringify({
            error: {
              message: `Failed to parse locations response: ${error.message}`,
              code: 500
            },
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