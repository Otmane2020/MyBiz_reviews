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
              className="w-full bg-[#4285F4] text-white py-3 px-4 rounded-lg font-medium hover:bg-[#3367D6] focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
  try {
    console.log('🚀 Google OAuth function called')
    
    // Get environment variables
    const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
    
    console.log('🔑 Environment check:', {
              className="text-[#4285F4] hover:text-[#3367D6] font-medium"
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Accounts API response status:', accountsResponse.status)
        
        // Vérifier le type de contenu avant de parser en JSON
        const contentType = accountsResponse.headers.get('content-type')
        console.log('📋 Response content-type:', contentType)
        
        let accountsData
        if (contentType && contentType.includes('application/json')) {
          accountsData = await accountsResponse.json()
        } else {
          // Si ce n'est pas du JSON, lire comme texte pour diagnostiquer
          const textResponse = await accountsResponse.text()
          console.error('❌ Non-JSON response from Google API:', {
            status: accountsResponse.status,
            contentType,
            responsePreview: textResponse.substring(0, 500)
          })
          
          throw new Error(`Google API a renvoyé une réponse non-JSON (${accountsResponse.status}). Cela indique généralement un problème d'authentification ou de configuration. Vérifiez que votre token d'accès est valide et que l'API Google My Business est activée.`)
        }
        
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
    <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center p-4">
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
        const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        {/* Logo */}
          },
        <div className="text-center mb-8">
        })
          <StarlinkoLogo size="lg" showText={true} className="text-white justify-center" />

        </div>
        console.log('📊 Google My Business Locations API response status:', locationsResponse.status)

        const locationsData = await locationsResponse.json()
        console.log('🏪 Locations data received:', {
          hasLocations: !!locationsData.locations,
          locationsCount: locationsData.locations?.length || 0,
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          error: locationsData.error
        
        if (!locationsResponse.ok) {
          console.error('❌ Locations API error:', locationsData)
          
          let errorMessage = 'Erreur inconnue'
          if (locationsData.error) {
            if (locationsData.error.code === 401) {
            <div className="mb-6 p-4 bg-[#EA4335]/10 border border-[#EA4335]/20 rounded-lg">
              errorMessage = 'Token d\'accès expiré ou invalide'
              <p className="text-[#EA4335] text-sm">{error}</p>
            } else if (locationsData.error.code === 404) {
              errorMessage = 'Aucun établissement trouvé pour ce compte'
            } else {
              errorMessage = locationsData.error.message || `Erreur ${locationsData.error.code}`
          {/* Google Login Button */}
            }
          <button
          }
            onClick={handleGoogleLogin}
          
            disabled={loading}
          return new Response(
            className="w-full mb-6 flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#4285F4] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            JSON.stringify({
          >
              error: {
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                message: errorMessage,
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                code: locationsData.error?.code || locationsResponse.status
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              },
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              success: false
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            }),
            </svg>
            {
            {loading ? 'Connexion...' : 'Continuer avec Google'}
              status: locationsResponse.status,
          </button>
              headers: {

                'Content-Type': 'application/json',
          <div className="relative mb-6">
                ...corsHeaders,
            <div className="absolute inset-0 flex items-center">
              },
              <div className="w-full border-t border-gray-300" />
            }
            </div>
          )
            <div className="relative flex justify-center text-sm">
        }
              <span className="px-2 bg-white text-gray-500">Ou</span>

            </div>
        console.log('✅ Locations retrieved successfully')
          </div>
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
        throw fetchError
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"

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
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4285F4] focus:border-transparent"
  }