import { supabase } from './supabase';

interface GoogleBusiness {
  place_id: string;
  name: string;
  formatted_address: string;
  rating?: number;
  user_ratings_total?: number;
}

interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
  relative_time_description?: string;
}

export async function importGoogleReviews(
  business: GoogleBusiness,
  userId: string
): Promise<{ success: boolean; reviewsCount: number; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${business.place_id}&fields=reviews&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Erreur API Google: ${data.status}`);
    }

    const reviews: GoogleReview[] = data.result?.reviews || [];

    if (reviews.length === 0) {
      return { success: true, reviewsCount: 0 };
    }

    const { data: locationData, error: locationError } = await supabase
      .from('locations')
      .upsert({
        user_id: userId,
        location_id: business.place_id,
        location_name: business.name,
        address: business.formatted_address,
        is_active: true,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,location_id'
      })
      .select()
      .single();

    if (locationError) {
      throw new Error(`Erreur lors de la sauvegarde de l'établissement: ${locationError.message}`);
    }

    const reviewsToInsert = reviews.map(review => ({
      location_id: locationData.id,
      user_id: userId,
      reviewer_name: review.author_name,
      rating: review.rating,
      review_text: review.text,
      review_date: new Date(review.time * 1000).toISOString(),
      source: 'google',
      external_id: `${business.place_id}_${review.time}`,
      is_replied: false
    }));

    const { error: reviewsError } = await supabase
      .from('reviews')
      .upsert(reviewsToInsert, {
        onConflict: 'external_id',
        ignoreDuplicates: true
      });

    if (reviewsError) {
      throw new Error(`Erreur lors de l'importation des avis: ${reviewsError.message}`);
    }

    return { success: true, reviewsCount: reviews.length };

  } catch (error) {
    console.error('Error importing reviews:', error);
    return {
      success: false,
      reviewsCount: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

export async function importGoogleReviewsViaEdgeFunction(
  business: GoogleBusiness,
  userId: string
): Promise<{ success: boolean; reviewsCount: number; error?: string }> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Configuration Supabase manquante');
    }

    console.log('🚀 Importing business:', business.name, business.place_id);

    // Step 1: Create location in database
    const { error: locationError } = await supabase
      .from('locations')
      .upsert({
        user_id: userId,
        location_id: business.place_id,
        location_name: business.name,
        address: business.formatted_address,
        is_active: true,
        last_synced_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,location_id'
      });

    if (locationError) {
      console.error('Error creating location:', locationError);
      throw new Error(`Erreur lors de la sauvegarde de l'établissement: ${locationError.message}`);
    }

    console.log('✅ Location created, now fetching reviews...');

    // Step 2: Call edge function to auto-fetch reviews
    const reviewsResponse = await fetch(
      `${supabaseUrl}/functions/v1/auto-fetch-reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          locationId: business.place_id,
          userId: userId,
          placeId: business.place_id
        })
      }
    );

    if (!reviewsResponse.ok) {
      const errorData = await reviewsResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Erreur HTTP: ${reviewsResponse.status}`);
    }

    const reviewsData = await reviewsResponse.json();

    if (!reviewsData.success) {
      throw new Error(reviewsData.error || 'Erreur lors de la récupération des avis');
    }

    console.log(`✅ Successfully imported ${reviewsData.reviewsAdded} reviews`);

    return {
      success: true,
      reviewsCount: reviewsData.reviewsAdded || 0
    };

  } catch (error) {
    console.error('Error importing reviews:', error);
    return {
      success: false,
      reviewsCount: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
