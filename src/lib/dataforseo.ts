import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  zip_code: string;
  country: string;
  phone: string;
  website: string;
  category: string;
  rating: number;
  reviews_count: number;
  place_id: string;
  cid: string;
  google_maps_url: string;
  latitude: number | null;
  longitude: number | null;
  verified: boolean;
}

export interface Review {
  review_id: string;
  author: string;
  author_image: string | null;
  rating: number;
  comment: string;
  review_date: string;
  replied: boolean;
  reply_text: string | null;
  reply_date: string | null;
}

export async function searchBusinessLocations(
  businessName: string,
  address?: string
): Promise<BusinessLocation[]> {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/dataforseo-locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        businessName,
        address,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to search locations');
    }

    return data.locations || [];
  } catch (error) {
    console.error('Error searching business locations:', error);
    throw error;
  }
}

export async function fetchBusinessReviews(
  placeId?: string,
  cid?: string
): Promise<{ success: boolean; reviews: Review[]; newReviews: number; totalReviews: number }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/dataforseo-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        placeId,
        cid,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch reviews');
    }

    return {
      success: true,
      reviews: data.reviews || [],
      newReviews: data.newReviews || 0,
      totalReviews: data.totalReviews || 0,
    };
  } catch (error) {
    console.error('Error fetching business reviews:', error);
    throw error;
  }
}

export async function generateAutoReply(
  reviewId: string,
  action: 'generate' | 'send' = 'generate'
): Promise<{ success: boolean; reply: string; usage?: any }> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-reply-reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        reviewId,
        action,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate reply');
    }

    return {
      success: true,
      reply: data.reply,
      usage: data.usage,
    };
  } catch (error) {
    console.error('Error generating auto reply:', error);
    throw error;
  }
}

export async function saveLocationToDatabase(
  userId: string,
  location: BusinessLocation
): Promise<void> {
  try {
    const { error } = await supabase
      .from('locations')
      .upsert({
        user_id: userId,
        location_id: location.place_id || location.cid,
        location_name: location.name,
        address: location.address,
        category: location.category,
        is_active: true,
        last_synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,location_id'
      });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error saving location to database:', error);
    throw error;
  }
}
