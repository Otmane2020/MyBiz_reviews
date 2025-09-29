import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
}

// Configuration Google OAuth
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
    console.log('🚀 Auth-login function called', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    })
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Vérifier les variables d'environnement
    console.log('🔑 Environment check:', {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET,
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseServiceKey,
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
    let requestData;
    try {
      const bodyText = await req.text()
      console.log('📥 Raw request body:', bodyText.substring(0, 200))
      requestData = JSON.parse(bodyText)
      console.log('📋 Parsed request data:', {
        action: requestData.action,
        hasCode: !!requestData.code,
        codeLength: requestData.code?.length || 0,
        redirectUri: requestData.redirectUri
      })
    } catch (parseError) {
      console.error('❌ Error parsing request body:', parseError)
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

    // ==========================================
    // ACTION: exchange-code
    // ==========================================
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

    // ==========================================
    // ACTION: get-accounts (Google My Business)
    // ==========================================
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
        // Utiliser la nouvelle API Google My Business
        const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Accounts API response status:', accountsResponse.status)
        const accountsData = await accountsResponse.json()
        console.log('🏢 Accounts data received:', {
          hasAccounts: !!accountsData.accounts,
          accountsCount: accountsData.accounts?.length || 0,
          error: accountsData.error,
          fullResponse: accountsData
        })
        
        if (!accountsResponse.ok) {
          console.error('❌ Accounts API error:', accountsData)
          
          let errorMessage = 'Erreur inconnue'
          if (accountsData.error) {
            if (accountsData.error.code === 401) {
              errorMessage = 'Token d\'accès expiré ou invalide'
            } else if (accountsData.error.code === 403) {
              errorMessage = 'Accès refusé. Vérifiez que l\'API Google My Business est activée et que vous avez les permissions nécessaires'
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
                details: accountsData
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

    // ==========================================
    // ACTION: get-locations (Google My Business)
    // ==========================================
    if (action === 'get-locations') {
      const { accessToken, accountName } = requestData

      console.log('🏪 Get locations parameters:', {
        hasAccessToken: !!accessToken,
        hasAccountName: !!accountName,
        accountName: accountName
      })

      if (!accessToken || !accountName) {
        console.error('❌ Missing access token or account name for get-locations')
        return new Response(
          JSON.stringify({ 
            error: 'Access token et account name requis',
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

      console.log('🏪 Getting locations for account:', accountName)
      
      try {
        // Utiliser la nouvelle API Google My Business Business Information
        const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Locations API response status:', locationsResponse.status)
        const locationsData = await locationsResponse.json()
        console.log('🏪 Locations data received:', {
          hasLocations: !!locationsData.locations,
          locationsCount: locationsData.locations?.length || 0,
          error: locationsData.error,
          fullResponse: locationsData
        })
        
        if (!locationsResponse.ok) {
          console.error('❌ Locations API error:', locationsData)
          
          let errorMessage = 'Erreur inconnue'
          if (locationsData.error) {
            if (locationsData.error.code === 401) {
              errorMessage = 'Token d\'accès expiré ou invalide'
            } else if (locationsData.error.code === 403) {
              errorMessage = 'Accès refusé aux établissements. Vérifiez les permissions de l\'API'
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
                details: locationsData
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

    // ==========================================
    // ACTION: get-reviews (Google My Business)
    // ==========================================
    if (action === 'get-reviews') {
      const { accessToken, locationName } = requestData

      console.log('⭐ Get reviews parameters:', {
        hasAccessToken: !!accessToken,
        hasLocationName: !!locationName,
        locationName: locationName
      })

      if (!accessToken || !locationName) {
        console.error('❌ Missing access token or location name for get-reviews')
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

      console.log('⭐ Getting reviews for location:', locationName)
      
      try {
        // Utiliser l'API Google My Business Business Information pour les avis
        const reviewsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/reviews`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })

        console.log('📊 Google My Business Reviews API response status:', reviewsResponse.status)
        const reviewsData = await reviewsResponse.json()
        console.log('⭐ Reviews data received:', {
          hasReviews: !!reviewsData.reviews,
          reviewsCount: reviewsData.reviews?.length || 0,
          error: reviewsData.error,
          fullResponse: reviewsData
        })
        
        if (!reviewsResponse.ok) {
          console.error('❌ Reviews API error:', reviewsData)
          
          let errorMessage = 'Erreur inconnue'
          if (reviewsData.error) {
            if (reviewsData.error.code === 401) {
              errorMessage = 'Token d\'accès expiré ou invalide'
            } else if (reviewsData.error.code === 403) {
              errorMessage = 'Accès refusé aux avis. Vérifiez les permissions de l\'API'
            } else if (reviewsData.error.code === 404) {
              errorMessage = 'Aucun avis trouvé pour cet établissement'
            } else {
              errorMessage = reviewsData.error.message || `Erreur ${reviewsData.error.code}`
            }
          }
          
          return new Response(
            JSON.stringify({
              error: {
                message: errorMessage,
                code: reviewsData.error?.code || reviewsResponse.status,
                details: reviewsData
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

        // Stocker les avis dans Supabase
        let newReviewsCount = 0
        const newReviews = []

        if (reviewsData.reviews && reviewsData.reviews.length > 0) {
          for (const review of reviewsData.reviews) {
            const reviewId = review.name?.split('/').pop() || `review_${Date.now()}_${Math.random()}`
            
            // Vérifier si l'avis existe déjà
            const { data: existingReview } = await supabase
              .from('reviews')
              .select('id')
              .eq('review_id', reviewId)
              .single()

            if (!existingReview) {
              // Convertir la note Google en nombre
              const ratingMap: { [key: string]: number } = {
                'ONE': 1,
                'TWO': 2,
                'THREE': 3,
                'FOUR': 4,
                'FIVE': 5,
              }

              const reviewData = {
                review_id: reviewId,
                location_id: locationName,
                author: review.reviewer?.displayName || 'Anonyme',
                rating: ratingMap[review.starRating] || 5,
                comment: review.comment || '',
                review_date: review.createTime || new Date().toISOString(),
                replied: !!review.reviewReply,
              }

              // Insérer le nouvel avis
              const { error } = await supabase
                .from('reviews')
                .insert([reviewData])

              if (error) {
                console.error('❌ Error inserting review:', error)
              } else {
                newReviewsCount++
                newReviews.push(reviewData)
                console.log('✅ New review inserted:', reviewId)
              }
            }
          }
        }

        console.log('✅ Reviews retrieved and stored successfully')
        return new Response(
          JSON.stringify({
            reviews: reviewsData.reviews || [],
            totalReviews: reviewsData.reviews?.length || 0,
            newReviews: newReviewsCount,
            storedReviews: newReviews,
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
    console.error('💥 Unexpected error in auth-login function:', error)
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