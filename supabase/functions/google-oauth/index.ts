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
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      clientIdLength: GOOGLE_CLIENT_ID?.length || 0
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
    console.log('📥 Parsing request body...')
    const requestData = await req.json()
    const { action } = requestData
    
    console.log('🎯 Action requested:', action)

    if (action === 'exchange-code') {
      const { code, redirectUri } = requestData

      console.log('📋 Exchange code parameters:', {
        hasCode: !!code,
        codeLength: code?.length || 0,
        redirectUri: redirectUri
      })

      if (!code || !redirectUri) {
        console.error('❌ Missing code or redirectUri')
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

      console.log('🔄 Exchanging code for tokens with Google...')

      try {
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

        console.log('📊 Google Token API response status:', tokenResponse.status)
        
        const tokens = await tokenResponse.json()
        console.log('📄 Google Token API response:', {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in,
          error: tokens.error,
          errorDescription: tokens.error_description
        })

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

        console.log('👤 Fetching user info from Google...')
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        })

        console.log('📊 Google User Info API response status:', userResponse.status)
        const userData = await userResponse.json()
        console.log('👤 User data received:', {
          hasId: !!userData.id,
          hasEmail: !!userData.email,
          hasName: !!userData.name,
          error: userData.error
        })
        
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
      } catch (fetchError) {
        console.error('💥 Error during token exchange fetch:', fetchError)
        throw fetchError
      }
    }

    if (action === 'get-accounts') {
      const { accessToken } = requestData

      console.log('🏢 Get accounts parameters:', {
        hasAccessToken: !!accessToken,
        tokenLength: accessToken?.length || 0
      })

      if (!accessToken) {
        console.error('❌ Missing access token for get-accounts')
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

      console.log('🏢 Getting Google My Business accounts...')
      
      try {
        // Essayer d'abord la nouvelle API, puis l'ancienne en fallback
        let accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Accounts API response status:', accountsResponse.status)
        let accountsData = await accountsResponse.json()
        console.log('🏢 Accounts data received:', {
          hasAccounts: !!accountsData.accounts,
          accountsCount: accountsData.accounts?.length || 0,
          error: accountsData.error
        })
        
        // Si la nouvelle API échoue, essayer l'ancienne
        if (!accountsResponse.ok && accountsResponse.status === 403) {
          console.log('🔄 Trying legacy API...')
          accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })
          
          accountsData = await accountsResponse.json()
          console.log('🏢 Legacy API response:', {
            status: accountsResponse.status,
            hasAccounts: !!accountsData.accounts,
            accountsCount: accountsData.accounts?.length || 0,
            error: accountsData.error
          })
        }
        
        if (!accountsResponse.ok) {
          console.error('❌ Accounts API error:', accountsData)
          
          let errorMessage = 'Erreur inconnue'
          if (accountsData.error) {
            if (accountsData.error.code === 401) {
              errorMessage = 'Token d\'accès expiré ou invalide'
            } else if (accountsData.error.code === 403) {
              errorMessage = 'Accès refusé. Vérifiez que l\'API Google My Business est activée et que vous avez un profil d\'entreprise Google'
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
                code: accountsData.error?.code || accountsResponse.status
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
      } catch (fetchError) {
        console.error('💥 Error during accounts fetch:', fetchError)
        throw fetchError
      }
    }

    if (action === 'get-locations') {
      const { accessToken, accountId } = requestData

      console.log('🏪 Get locations parameters:', {
        hasAccessToken: !!accessToken,
        hasAccountId: !!accountId,
        accountId: accountId
      })

      if (!accessToken || !accountId) {
        console.error('❌ Missing access token or account ID for get-locations')
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
      
      try {
        // Essayer d'abord la nouvelle API, puis l'ancienne en fallback
        let locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations`, {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Locations API response status:', locationsResponse.status)
        let locationsData = await locationsResponse.json()
        console.log('🏪 Locations data received:', {
          hasLocations: !!locationsData.locations,
          locationsCount: locationsData.locations?.length || 0,
          error: locationsData.error
        })
        
        // Si la nouvelle API échoue, essayer l'ancienne
        if (!locationsResponse.ok && locationsResponse.status === 403) {
          console.log('🔄 Trying legacy locations API...')
          locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          })
          
          locationsData = await locationsResponse.json()
          console.log('🏪 Legacy locations API response:', {
            status: locationsResponse.status,
            hasLocations: !!locationsData.locations,
            locationsCount: locationsData.locations?.length || 0,
            error: locationsData.error
          })
        }
        
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
                code: locationsData.error?.code || locationsResponse.status
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
      } catch (fetchError) {
        console.error('💥 Error during locations fetch:', fetchError)
        throw fetchError
      }
    }

    // Action non supportée
    console.error('❌ Unsupported action:', action)
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
    console.error('Error stack:', error.stack)
    
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