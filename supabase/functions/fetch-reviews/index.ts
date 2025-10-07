import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.error('❌ Google credentials not configured');
    } else {
      console.log('✅ Google credentials found');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      if (user && !userError) {
        userId = user.id;
        console.log('✅ Authenticated user:', userId);
      } else {
        throw new Error('User authentication required');
      }
    } else {
      throw new Error('Authorization header required');
    }

    const { accessToken, locationId } = await req.json();

    if (!accessToken || !locationId) {
      throw new Error('Access token and location ID are required');
    }

    console.log('📡 Fetching reviews for location:', locationId);
    console.log('👤 User ID:', userId);

    const { data: locationData } = await supabase
      .from('locations')
      .select('id')
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .maybeSingle();

    if (!locationData) {
      throw new Error('Location not found or not authorized for this user');
    }

    const reviewsResponse = await fetch(
      `https://mybusiness.googleapis.com/v4/${locationId}/reviews`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    console.log('📥 Reviews API response status:', reviewsResponse.status);

    if (!reviewsResponse.ok) {
      const errorData = await reviewsResponse.json();
      console.error('❌ Google API error:', errorData);
      throw new Error(`Google API error (${reviewsResponse.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const reviewsData = await reviewsResponse.json();
    const googleReviews = reviewsData.reviews || [];
    console.log(`📦 Found ${googleReviews.length} reviews from Google`);

    let newReviewsCount = 0;
    const newReviews = [];

    for (const review of googleReviews) {
      const reviewId = review.reviewId;

      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingReview) {
        const ratingMap: { [key: string]: number } = {
          'ONE': 1,
          'TWO': 2,
          'THREE': 3,
          'FOUR': 4,
          'FIVE': 5,
        };

        const reviewData = {
          user_id: userId,
          review_id: reviewId,
          location_id: locationId,
          author: review.reviewer?.displayName || 'Anonyme',
          rating: ratingMap[review.starRating] || 5,
          comment: review.comment || '',
          review_date: review.createTime,
          replied: !!review.reviewReply,
          reply_content: review.reviewReply?.comment || null,
          reply_source: review.reviewReply ? null : null,
          replied_at: review.reviewReply?.updateTime || null,
        };

        const { error } = await supabase
          .from('reviews')
          .insert([reviewData]);

        if (error) {
          console.error('❌ Error inserting review:', error);
        } else {
          newReviewsCount++;
          newReviews.push(reviewData);
        }
      }
    }

    await supabase
      .from('locations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('location_id', locationId);

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    await supabase.rpc('get_or_create_usage_tracking', { p_user_id: userId });

    await supabase
      .from('usage_tracking')
      .update({
        reviews_synced: supabase.rpc('reviews_synced') + newReviewsCount
      })
      .eq('user_id', userId)
      .eq('month', currentMonth.toISOString().split('T')[0]);

    console.log(`✅ Successfully synced ${newReviewsCount} new reviews for user ${userId}`);

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
    );

  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
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
    );
  }
});
