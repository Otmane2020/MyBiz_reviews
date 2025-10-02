import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// Récupérer les identifiants depuis les variables d'environnement
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    // Vérifier que les variables d'environnement sont configurées
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_API_KEY) {
      console.error('Google credentials not configured')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { accessToken, locationId } = await req.json()

    if (!accessToken || !locationId) {
      throw new Error('Access token and location ID are required')
    }

    // Fetch reviews from Google My Business API
    const reviewsResponse = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews?key=${GOOGLE_API_KEY}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!reviewsResponse.ok) {
      throw new Error(`Google API error: ${reviewsResponse.status}`)
    }

    const reviewsData = await reviewsResponse.json()
    const googleReviews = reviewsData.reviews || []

    let newReviewsCount = 0
    const newReviews = []

    // Process each review
    for (const review of googleReviews) {
      const reviewId = review.reviewId
      
      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('review_id', reviewId)
        .single()

      if (!existingReview) {
        // Convert Google rating to number
        const ratingMap: { [key: string]: number } = {
          'ONE': 1,
          'TWO': 2,
          'THREE': 3,
          'FOUR': 4,
          'FIVE': 5,
        }

        const reviewData = {
          review_id: reviewId,
          location_id: locationId,
          author: review.reviewer?.displayName || 'Anonyme',
          rating: ratingMap[review.starRating] || 5,
          comment: review.comment || '',
          review_date: review.createTime,
          replied: !!review.reviewReply,
        }

        // Insert new review
        const { error } = await supabase
          .from('reviews')
          .insert([reviewData])

        if (error) {
          console.error('Error inserting review:', error)
        } else {
          newReviewsCount++
          newReviews.push(reviewData)
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalReviews: googleReviews.length,
        newReviews: newReviewsCount,
        reviews: newReviews,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('Error fetching reviews:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
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