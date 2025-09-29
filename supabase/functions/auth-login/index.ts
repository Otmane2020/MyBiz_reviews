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
    console.log('🚀 Auth-login function called')
    
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
          error: 'Configuration Google OAuth manquante. Vérifiez GOOGLE_CLIENT_ID et GOOGLE_CLIENT_SECRET dans les variables d\'environnement Supabase.',
          details: {
            hasClientId: !!GOOGLE_CLIENT_ID,
            hasClientSecret: !!GOOGLE_CLIENT_SECRET,
            clientIdPreview: GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'MISSING'
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
          
          return new Response(
            JSON.stringify({
              error: {
                message: `Google API a renvoyé une réponse non-JSON (${accountsResponse.status}). Cela indique généralement un problème d'authentification ou de configuration.`,
                details: {
                  status: accountsResponse.status,
                  contentType,
                  responsePreview: textResponse.substring(0, 200),
                  suggestions: [
                    'Vérifiez que votre token d\'accès est valide',
                    'Assurez-vous que l\'API Google My Business est activée dans Google Cloud Console',
                    'Vérifiez que vous avez un profil d\'entreprise Google configuré'
                  ]
                }
              },
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
          
          const legacyContentType = accountsResponse.headers.get('content-type')
          if (legacyContentType && legacyContentType.includes('application/json')) {
            accountsData = await accountsResponse.json()
          } else {
            const textResponse = await accountsResponse.text()
            console.error('❌ Legacy API also returned non-JSON:', {
              status: accountsResponse.status,
              contentType: legacyContentType,
              responsePreview: textResponse.substring(0, 200)
            })
          }
          
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
          let suggestions = []
          
          if (accountsData && accountsData.error) {
            if (accountsData.error.code === 401) {
              errorMessage = 'Token d\'accès expiré ou invalide'
              suggestions = ['Reconnectez-vous à Google', 'Vérifiez les permissions de votre application']
            } else if (accountsData.error.code === 403) {
              errorMessage = 'Accès refusé. Vérifiez que l\'API Google My Business est activée et que vous avez un profil d\'entreprise Google'
              suggestions = [
                'Activez l\'API Google My Business dans Google Cloud Console',
                'Créez un profil d\'entreprise Google si vous n\'en avez pas',
                'Vérifiez que votre compte a les permissions nécessaires'
              ]
            } else if (accountsData.error.code === 404) {
              errorMessage = 'Aucun compte Google My Business trouvé'
              suggestions = ['Créez un profil d\'entreprise Google', 'Vérifiez que vous êtes connecté avec le bon compte']
            } else {
              errorMessage = accountsData.error.message || `Erreur ${accountsData.error.code}`
              suggestions = ['Consultez la documentation Google My Business API']
            }
          }
          
          return new Response(
            JSON.stringify({
              error: {
                message: errorMessage,
                code: accountsData?.error?.code || accountsResponse.status,
                details: accountsData?.error,
                suggestions
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
        return new Response(
          JSON.stringify({
            error: {
              message: 'Erreur lors de la récupération des comptes',
              details: fetchError.message,
              suggestions: [
                'Vérifiez votre connexion internet',
                'Réessayez dans quelques minutes',
                'Vérifiez que les APIs Google sont accessibles'
              ]
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
          },
        })

        console.log('📊 Google My Business Locations API response status:', locationsResponse.status)
        
        // Vérifier le type de contenu
        const contentType = locationsResponse.headers.get('content-type')
        let locationsData
        
        if (contentType && contentType.includes('application/json')) {
          locationsData = await locationsResponse.json()
        } else {
          const textResponse = await locationsResponse.text()
          console.error('❌ Non-JSON response from Locations API:', {
            status: locationsResponse.status,
            contentType,
            responsePreview: textResponse.substring(0, 500)
          })
          
          return new Response(
            JSON.stringify({
              error: {
                message: `L'API Locations a renvoyé une réponse non-JSON (${locationsResponse.status})`,
                details: {
                  status: locationsResponse.status,
                  contentType,
                  responsePreview: textResponse.substring(0, 200)
                }
              },
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
        
        console.log('🏪 Locations data received:', {
          hasLocations: !!locationsData.locations,
          locationsCount: locationsData.locations?.length || 0,
          error: locationsData.error
        })
        
        if (!locationsResponse.ok) {
          console.error('❌ Locations API error:', locationsData)
          
          let errorMessage = 'Erreur inconnue'
          if (locationsData && locationsData.error) {
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
                code: locationsData?.error?.code || locationsResponse.status
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
        return new Response(
          JSON.stringify({
            error: {
              message: 'Erreur lors de la récupération des établissements',
              details: fetchError.message
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
    }

    if (action === 'get-reviews') {
      const { accessToken, locationName } = requestData

      if (!accessToken || !locationName) {
        return new Response(
          JSON.stringify({ 
            error: 'Access token et location name requis',
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

      try {
        const reviewsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/reviews`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (!reviewsResponse.ok) {
          const errorData = await reviewsResponse.json()
          return new Response(
            JSON.stringify({
              error: {
                message: `Erreur lors de la récupération des avis: ${errorData.error?.message || reviewsResponse.status}`,
                code: errorData.error?.code || reviewsResponse.status
              },
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

        const reviewsData = await reviewsResponse.json()
        
        return new Response(
          JSON.stringify({
            reviews: reviewsData.reviews || [],
            totalReviews: reviewsData.reviews?.length || 0,
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
        console.error('💥 Error during reviews fetch:', fetchError)
        return new Response(
          JSON.stringify({
            error: {
              message: 'Erreur lors de la récupération des avis',
              details: fetchError.message
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
    console.error('💥 Unexpected error in auth-login function:', error)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur interne du serveur',
        details: error.stack,
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