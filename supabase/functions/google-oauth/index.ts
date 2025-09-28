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
      throw new Error('Google OAuth credentials not configured in environment variables')
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'exchange-code') {
      // Échanger le code d'autorisation contre des tokens
      const { code, redirectUri } = await req.json()

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
      const { refreshToken } = await req.json()

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

    if (action === 'get-reviews') {
      // Récupérer les avis Google My Business
      const { accessToken, locationId } = await req.json()

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
      const { accessToken, locationId, reviewId, comment } = await req.json()

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
    return new Response(
      JSON.stringify({ error: error.message }),
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