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
      if (session?.user && !showOnboarding) {
        setCurrentPage('dashboard');
      } else if (!session?.user) {
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
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (token && userParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        setAccessToken(token);
        localStorage.setItem('accessToken', token);
        localStorage.setItem('googleUser', JSON.stringify(userData));
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Show onboarding for new users
        const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted');
        if (!hasCompletedOnboarding) {
          setShowOnboarding(true);
        } else {
          setCurrentPage('dashboard');
        }
      } catch (error) {
        console.error('Error parsing OAuth callback:', error);
        window.history.replaceState({}, document.title, window.location.pathname);
      })
      console.log('🏪 Getting locations for account:', accountId)
      
      try {
        const locationsResponse = await fetch(`https://mybusiness.googleapis.com/v4/${accountId}/locations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Locations API response status:', locationsResponse.status)
      <Onboarding
          error: locationsData.error
        })
        
        if (!locationsResponse.ok) {
          console.error('❌ Locations API error:', locationsData)
          
          let errorMessage = 'Erreur inconnue'
            } else if (locationsData.error.code === 403) {
              errorMessage = 'Accès refusé aux établissements'
            onLogout={handleLogout}
            } else if (locationsData.error.code === 404) {
            }
      case 'reviews':
          }
          return new Response(
            accessToken={accessToken}
            JSON.stringify({
            selectedLocationId={selectedLocationId}
                code: locationsData.error?.code || locationsResponse.status
            setSelectedLocationId={setSelectedLocationId}
              },
            selectedAccountId={selectedAccountId}
              success: false
            onNavigate={setCurrentPage}
            }),
            {
              status: locationsResponse.status,
              headers: {
            }
          )
        }

  }, []);
    console.error('💥 Unexpected error in google-oauth function:', error)
  const handleOnboardingComplete = (selectedStores: string[], selectedPlan: string) => {
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('selectedStores');
    localStorage.removeItem('selectedPlan');
    setAccessToken('');
    setCurrentPage('landing');
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
      <div className="min-h-screen bg-gradient-to-br from-[#4285F4] via-[#34A853] to-[#FBBC05] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      }
    )
  }
})