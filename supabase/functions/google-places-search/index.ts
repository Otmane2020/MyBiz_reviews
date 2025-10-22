import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Enhanced CORS configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Request-ID",
  "Access-Control-Max-Age": "86400",
};

// Rate limiting storage (in-memory for simplicity, consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100; // 100 requests per minute

// Input validation schemas
const requestSchemas = {
  search: {
    required: ['query'],
    properties: {
      query: { type: 'string', minLength: 1, maxLength: 500 },
      location: { type: 'string', maxLength: 200 },
      action: { type: 'string', enum: ['search'] }
    }
  },
  reviews: {
    required: ['placeId'],
    properties: {
      placeId: { type: 'string', minLength: 1, maxLength: 255 },
      action: { type: 'string', enum: ['get-reviews'] }
    }
  }
};

// Validation function
function validateInput(data: any, schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  for (const field of schema.required) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      errors.push(`Field '${field}' is required`);
    }
  }

  // Check field types and constraints
  for (const [field, rules] of Object.entries(schema.properties)) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = data[field];
      const rule = rules as any;

      if (rule.type === 'string') {
        if (typeof value !== 'string') {
          errors.push(`Field '${field}' must be a string`);
        } else {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`Field '${field}' must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`Field '${field}' must be at most ${rule.maxLength} characters`);
          }
        }
      }

      if (rule.enum && !rule.enum.includes(value)) {
        errors.push(`Field '${field}' must be one of: ${rule.enum.join(', ')}`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowKey = Math.floor(now / RATE_LIMIT_WINDOW);
  const key = `${identifier}:${windowKey}`;

  const current = rateLimitStore.get(key) || { count: 0, resetTime: (windowKey + 1) * RATE_LIMIT_WINDOW };

  if (now > current.resetTime) {
    rateLimitStore.delete(key);
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetTime: (windowKey + 1) * RATE_LIMIT_WINDOW };
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime };
  }

  current.count++;
  rateLimitStore.set(key, current);

  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - current.count, 
    resetTime: current.resetTime 
  };
}

// Clean up old rate limit entries (basic garbage collection)
function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
}

// API response handler
function createResponse(data: any, status: number = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// Error response handler
function createErrorResponse(message: string, status: number = 500, details: any = null) {
  return createResponse({
    error: message,
    success: false,
    ...(details && { details })
  }, status);
}

// Google Maps API service
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

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API returned status: ${data.status}`);
    }

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

// Main request handler
Deno.serve(async (req: Request) => {
  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Generate request ID for tracking
  const requestId = crypto.randomUUID();
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown';

  // Rate limiting
  cleanupRateLimit();
  const rateLimit = checkRateLimit(clientIP);
  
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'Rate limit exceeded', 
      429,
      {
        requestId,
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    );
  }

  // Add rate limit headers to all responses
  const rateLimitHeaders = {
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
    'X-Request-ID': requestId
  };

  try {
    // Validate HTTP method
    if (req.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405, { requestId });
    }

    // Validate content type
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return createErrorResponse('Content-Type must be application/json', 400, { requestId });
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400, { requestId });
    }

    const { query, location, action, placeId } = body;

    // Get API key
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    
    if (!apiKey) {
      console.error(`[${requestId}] Google Maps API key not configured`);
      return createErrorResponse("Service configuration error", 500, { requestId });
    }

    const mapsService = new GoogleMapsService(apiKey);

    // Handle different actions
    if (action === 'get-reviews') {
      // Validate reviews request
      const validation = validateInput(body, requestSchemas.reviews);
      if (!validation.isValid) {
        return createErrorResponse('Validation failed', 400, {
          requestId,
          errors: validation.errors
        });
      }

      const reviewsData = await mapsService.getPlaceReviews(placeId);
      
      return createResponse({
        success: true,
        ...reviewsData,
        requestId
      }, 200, rateLimitHeaders);

    } else if (action === 'search' || !action) {
      // Validate search request
      const validation = validateInput(body, requestSchemas.search);
      if (!validation.isValid) {
        return createErrorResponse('Validation failed', 400, {
          requestId,
          errors: validation.errors
        });
      }

      const searchResults = await mapsService.searchPlaces(query, location);
      
      return createResponse({
        success: true,
        results: searchResults.results,
        status: searchResults.status,
        nextPageToken: searchResults.nextPageToken,
        requestId
      }, 200, rateLimitHeaders);

    } else {
      return createErrorResponse('Invalid action specified', 400, {
        requestId,
        validActions: ['search', 'get-reviews']
      });
    }

  } catch (error) {
    console.error(`[${requestId}] Error processing request:`, error);
    
    // Handle different types of errors appropriately
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('quota')) {
        return createErrorResponse('Service temporarily unavailable', 503, { requestId });
      }
      
      if (error.message.includes('ZERO_RESULTS')) {
        return createResponse({
          success: true,
          results: [],
          status: 'ZERO_RESULTS',
          message: 'No results found for the given query',
          requestId
        }, 200, rateLimitHeaders);
      }
    }

    return createErrorResponse(
      'Internal server error', 
      500, 
      { 
        requestId,
        ...(Deno.env.get("DENO_ENV") === "development" && { detail: error.message })
      }
    );
  }
});