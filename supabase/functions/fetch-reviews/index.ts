import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

// Récupérer les identifiants depuis les variables d'environnement
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Google credentials not configured');
      console.error('Available env vars:', Object.keys(Deno.env.toObject()));
    } else {
      console.log('✅ Google credentials found');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { accessToken, locationId } = await req.json()

    if (!accessToken || !locationId) {
      throw new Error('Access token and location ID are required')
    }

    console.log('📡 Fetching reviews for location:', locationId);
    console.log('🔑 Access token:', accessToken.substring(0, 20) + '...');

    const reviewsResponse = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    )

    console.log('📥 Reviews API response status:', reviewsResponse.status);

    if (!reviewsResponse.ok) {
      const errorData = await reviewsResponse.json();
      console.error('❌ Google API error:', errorData);
      throw new Error(`Google API error (${reviewsResponse.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const reviewsData = await reviewsResponse.json()
    console.log('📦 Reviews API response data:', JSON.stringify(reviewsData, null, 2));
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
        .maybeSingle()

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
    console.error('❌ Error fetching reviews:', error)
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        details: error.stack
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