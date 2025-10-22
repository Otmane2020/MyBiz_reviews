import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  query: string;
  location?: string;
  action?: string;
  placeId?: string;
}

class GoogleMapsService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPlaces(query: string, location?: string) {
    const searchQuery = location ? `${query} in ${location}` : query;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      results: data.results || [],
      status: data.status,
      nextPageToken: data.next_page_token
    };
  }

  async getPlaceDetails(placeId: string) {
    const fields = 'reviews,rating,user_ratings_total,name,formatted_address,geometry,photos,types';
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

    return data.result;
  }

  async getPlaceReviews(placeId: string) {
    const details = await this.getPlaceDetails(placeId);
    
    return {
      reviews: details.reviews || [],
      rating: details.rating,
      totalReviews: details.user_ratings_total,
      placeName: details.name,
      placeAddress: details.formatted_address,
      status: 'OK'
    };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed', success: false }), 
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { query, location, action, placeId } = body;

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    
    if (!apiKey) {
      console.error('Google Maps API key not configured');
      return new Response(
        JSON.stringify({ 
          error: "La clé API Google Maps n'est pas configurée", 
          success: false 
        }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const mapsService = new GoogleMapsService(apiKey);

    if (action === 'get-reviews') {
      if (!placeId) {
        return new Response(
          JSON.stringify({ error: 'placeId is required', success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const reviewsData = await mapsService.getPlaceReviews(placeId);
      
      return new Response(
        JSON.stringify({ success: true, ...reviewsData }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'query is required', success: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchResults = await mapsService.searchPlaces(query, location);
    
    return new Response(
      JSON.stringify({
        success: true,
        results: searchResults.results,
        status: searchResults.status,
        nextPageToken: searchResults.nextPageToken
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage, 
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});