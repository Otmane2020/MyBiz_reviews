import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  locationId: string;
  userId: string;
  placeId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY') || Deno.env.get('GOOGLE_API_KEY');

    if (!googleApiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RequestBody = await req.json();
    const { locationId, userId, placeId } = body;

    console.log('🔍 Fetching reviews for location:', locationId, 'placeId:', placeId);

    // Fetch reviews from Google Places API in French (original language)
    // Force French language to get reviews in their original form without translation
    const fields = 'reviews,rating,user_ratings_total,name,formatted_address';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=fr&key=${googleApiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK') {
      console.error('❌ Google Places API error:', data.status);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Google Places API error: ${data.status}`,
          reviewsAdded: 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviews = data.result?.reviews || [];
    console.log(`📊 Found ${reviews.length} reviews from Google Places`);

    let reviewsAdded = 0;
    const newReviews: any[] = [];

    // Get location name for notifications
    const locationName = data.result?.name || 'Votre établissement';

    // Insert reviews into database
    for (const review of reviews) {
      const reviewId = review.author_url ?
        review.author_url.split('/').pop() + '_' + review.time :
        `review_${review.time}_${Math.random().toString(36).substr(2, 9)}`;

      const reviewDate = new Date(review.time * 1000).toISOString();

      // Use text directly since we're requesting in French
      const reviewText = review.text || '';

      // Check for owner reply
      const hasReply = review.author_reply !== undefined;
      const replyText = hasReply ? review.author_reply?.text || '' : null;
      const replyTime = hasReply ? review.author_reply?.time : null;
      const replyDate = replyTime ? new Date(replyTime * 1000).toISOString() : null;

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('review_id')
        .eq('review_id', reviewId)
        .maybeSingle();

      const isNewReview = !existingReview;

      const { error } = await supabase
        .from('reviews')
        .upsert({
          review_id: reviewId,
          location_id: locationId,
          author: review.author_name || 'Anonyme',
          rating: review.rating,
          comment: reviewText,
          review_date: reviewDate,
          replied: hasReply,
          reply_content: replyText,
          reply_source: hasReply ? 'google' : null,
          replied_at: replyDate,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'review_id',
          ignoreDuplicates: false
        });

      if (!error) {
        reviewsAdded++;

        // Track new reviews for notifications
        if (isNewReview) {
          newReviews.push({
            reviewId,
            author: review.author_name || 'Anonyme',
            rating: review.rating,
            comment: reviewText,
          });
        }
      } else {
        console.error('Error inserting review:', error);
      }
    }

    // Update location last_synced_at
    await supabase
      .from('locations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('location_id', locationId);

    console.log(`✅ Successfully added ${reviewsAdded} reviews for location ${locationId}`);

    // Send notifications for new reviews
    if (newReviews.length > 0) {
      console.log(`📧 Sending notifications for ${newReviews.length} new reviews`);

      // Check user notification preferences
      const { data: prefs } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const shouldNotify = prefs?.email_enabled !== false && prefs?.notify_new_review !== false;

      if (shouldNotify) {
        // Send notification for each new review
        for (const newReview of newReviews) {
          // Check if review meets notification criteria
          const shouldNotifyLowRating = prefs?.notify_low_rating !== false &&
                                       newReview.rating <= (prefs?.low_rating_threshold || 3);
          const shouldNotifyAllReviews = prefs?.notify_new_review !== false;

          if (shouldNotifyAllReviews || shouldNotifyLowRating) {
            try {
              await fetch(`${supabaseUrl}/functions/v1/send-review-notification`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${supabaseKey}`,
                },
                body: JSON.stringify({
                  reviewId: newReview.reviewId,
                  userId,
                  locationName,
                  author: newReview.author,
                  rating: newReview.rating,
                  comment: newReview.comment,
                }),
              });
            } catch (notifError) {
              console.error('Error sending notification:', notifError);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        reviewsAdded,
        totalReviews: reviews.length,
        newReviews: newReviews.length
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        reviewsAdded: 0
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
