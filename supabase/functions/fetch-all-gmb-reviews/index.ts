import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  locationName: string; // Format: accounts/{accountId}/locations/{locationId}
  userId: string;
  locationId: string; // Our internal location_id
  accessToken: string;
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
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body: RequestBody = await req.json();
    const { locationName, userId, locationId, accessToken } = body;

    console.log('🔍 Fetching ALL reviews for location:', locationName);

    // Fetch ALL reviews from Google My Business API
    let allReviews: any[] = [];
    let pageToken = '';
    let pageCount = 0;
    const maxPages = 10; // Safety limit

    do {
      const url = `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50${pageToken ? `&pageToken=${pageToken}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GMB API error:', response.status, errorText);
        throw new Error(`GMB API error: ${response.status}`);
      }

      const data = await response.json();
      const reviews = data.reviews || [];
      allReviews = allReviews.concat(reviews);

      console.log(`📄 Page ${pageCount + 1}: ${reviews.length} reviews`);

      pageToken = data.nextPageToken || '';
      pageCount++;
    } while (pageToken && pageCount < maxPages);

    console.log(`✅ Total reviews fetched: ${allReviews.length}`);

    let reviewsAdded = 0;
    let reviewsUpdated = 0;
    const newReviews: any[] = [];

    // Process each review
    for (const review of allReviews) {
      const reviewId = review.name ? review.name.split('/').pop() : review.reviewId;
      const starRating = review.starRating || 'STAR_RATING_UNSPECIFIED';
      const rating = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 }[starRating] || 3;

      const comment = review.comment || '';
      const reviewDate = review.createTime || new Date().toISOString();
      const author = review.reviewer?.displayName || 'Anonyme';

      // Check if review already exists
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('review_id, replied')
        .eq('review_id', reviewId)
        .maybeSingle();

      const isNewReview = !existingReview;

      // Check if there's a reply
      const hasReply = !!review.reviewReply;
      const replyContent = hasReply ? review.reviewReply.comment : null;
      const replyDate = hasReply ? review.reviewReply.updateTime : null;

      // Upsert review with reply info
      const { error } = await supabase
        .from('reviews')
        .upsert({
          review_id: reviewId,
          location_id: locationId,
          author,
          rating,
          comment,
          review_date: reviewDate,
          replied: hasReply,
          reply_content: replyContent,
          reply_source: hasReply ? 'google' : null,
          replied_at: replyDate,
          user_id: userId,
          created_at: existingReview ? undefined : new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'review_id',
          ignoreDuplicates: false
        });

      if (!error) {
        if (isNewReview) {
          reviewsAdded++;
          newReviews.push({ reviewId, author, rating, comment });
        } else {
          reviewsUpdated++;
        }
      } else {
        console.error('Error upserting review:', error);
      }
    }

    // Update location last_synced_at
    await supabase
      .from('locations')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('location_id', locationId);

    console.log(`✅ Added: ${reviewsAdded}, Updated: ${reviewsUpdated}`);

    // Send notifications for new reviews (same logic as auto-fetch-reviews)
    if (newReviews.length > 0) {
      console.log(`📧 Would send ${newReviews.length} notifications`);
      // TODO: Call notification function
    }

    return new Response(
      JSON.stringify({
        success: true,
        reviewsAdded,
        reviewsUpdated,
        totalReviews: allReviews.length,
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
