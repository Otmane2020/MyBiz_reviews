import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'

// Enhanced CORS configuration
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Request-ID",
  "Access-Control-Max-Age": "86400",
}

// Environment variables
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')
const GOOGLE_API_KEY = Deno.env.get('GOOGLE_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 50 // Lower limit for GMB API

// Input validation schema
const requestSchema = {
  required: ['accessToken', 'locationId'],
  properties: {
    accessToken: { type: 'string', minLength: 1 },
    locationId: { type: 'string', minLength: 1 },
    forceRefresh: { type: 'boolean' }
  }
}

// Validation function
function validateInput(data: any, schema: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  for (const field of schema.required) {
    if (!data[field]) {
      errors.push(`Field '${field}' is required`)
    }
  }

  for (const [field, rules] of Object.entries(schema.properties)) {
    if (data[field] !== undefined && data[field] !== null) {
      const value = data[field]
      const rule = rules as any

      if (rule.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${field}' must be a string`)
      } else if (rule.type === 'boolean' && typeof value !== 'boolean') {
        errors.push(`Field '${field}' must be a boolean`)
      }

      if (rule.minLength && value.length < rule.minLength) {
        errors.push(`Field '${field}' must be at least ${rule.minLength} characters`)
      }
    }
  }

  return { isValid: errors.length === 0, errors }
}

// Rate limiting function
function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowKey = Math.floor(now / RATE_LIMIT_WINDOW)
  const key = `${identifier}:${windowKey}`

  const current = rateLimitStore.get(key) || { count: 0, resetTime: (windowKey + 1) * RATE_LIMIT_WINDOW }

  if (now > current.resetTime) {
    rateLimitStore.delete(key)
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW, resetTime: (windowKey + 1) * RATE_LIMIT_WINDOW }
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }

  current.count++
  rateLimitStore.set(key, current)

  return { 
    allowed: true, 
    remaining: MAX_REQUESTS_PER_WINDOW - current.count, 
    resetTime: current.resetTime 
  }
}

// Clean up old rate limit entries
function cleanupRateLimit() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime + RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key)
    }
  }
}

// Response helpers
function createResponse(data: any, status: number = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...headers,
    },
  })
}

function createErrorResponse(message: string, status: number = 500, details: any = null) {
  return createResponse({
    error: message,
    success: false,
    ...(details && { details })
  }, status)
}

// Google My Business Service
class GoogleMyBusinessService {
  constructor(private apiKey: string) {}

  async fetchReviews(locationId: string, accessToken: string) {
    const url = `https://mybusiness.googleapis.com/v4/${locationId}/reviews?key=${this.apiKey}`
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Google My Business API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data.reviews || []
  }
}

// Review processing service
class ReviewProcessor {
  constructor(private supabase: any) {}

  private ratingMap: { [key: string]: number } = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5,
  }

  async processReviews(reviews: any[], locationId: string, userId: string, forceRefresh: boolean = false) {
    let newReviewsCount = 0
    const newReviews = []
    const skippedReviews = []

    for (const review of reviews) {
      const reviewId = review.reviewId
      
      // Check if review already exists (unless force refresh)
      if (!forceRefresh) {
        const { data: existingReview } = await this.supabase
          .from('reviews')
          .select('id, updated_at')
          .eq('review_id', reviewId)
          .single()

        if (existingReview) {
          skippedReviews.push(reviewId)
          continue
        }
      }

      try {
        const reviewData = this.transformReviewData(review, locationId, userId)
        const { error } = await this.supabase
          .from('reviews')
          .upsert([reviewData], { onConflict: 'review_id' })

        if (error) {
          console.error('Error upserting review:', error)
          throw error
        }

        newReviewsCount++
        newReviews.push(reviewData)
      } catch (error) {
        console.error(`Failed to process review ${reviewId}:`, error)
        // Continue with next review instead of failing entire batch
      }
    }

    return { newReviewsCount, newReviews, skippedReviews: skippedReviews.length }
  }

  private transformReviewData(review: any, locationId: string, userId: string) {
    return {
      review_id: review.reviewId,
      location_id: locationId,
      user_id: userId,
      author: review.reviewer?.displayName || 'Anonymous',
      rating: this.ratingMap[review.starRating] || 0,
      comment: review.comment || '',
      review_date: review.createTime,
      replied: !!review.reviewReply,
      reply_text: review.reviewReply?.comment || null,
      review_url: review.reviewReply?.updateTime ? review.reviewReply.updateTime : null,
      source: 'google_my_business',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
}

// Main handler
serve(async (req: Request) => {
  // Handle OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  // Generate request ID for tracking
  const requestId = crypto.randomUUID()
  const clientIP = req.headers.get('x-forwarded-for') || 'unknown'

  // Rate limiting
  cleanupRateLimit()
  const rateLimit = checkRateLimit(clientIP)
  
  if (!rateLimit.allowed) {
    return createErrorResponse(
      'Rate limit exceeded', 
      429,
      {
        requestId,
        retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
      }
    )
  }

  const rateLimitHeaders = {
    'X-RateLimit-Limit': MAX_REQUESTS_PER_WINDOW.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
    'X-Request-ID': requestId
  }

  try {
    // Validate environment variables
    if (!GOOGLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error(`[${requestId}] Missing required environment variables`)
      return createErrorResponse('Service configuration error', 500, { requestId })
    }

    // Validate HTTP method
    if (req.method !== 'POST') {
      return createErrorResponse('Method not allowed', 405, { requestId })
    }

    // Validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return createErrorResponse('Content-Type must be application/json', 400, { requestId })
    }

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return createErrorResponse('Invalid JSON in request body', 400, { requestId })
    }

    // Validate input
    const validation = validateInput(body, requestSchema)
    if (!validation.isValid) {
      return createErrorResponse('Validation failed', 400, {
        requestId,
        errors: validation.errors
      })
    }

    const { accessToken, locationId, forceRefresh = false } = body

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return createErrorResponse('Authorization header is required', 401, { requestId })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return createErrorResponse('Unauthorized: Invalid token', 401, { requestId })
    }

    // Fetch and process reviews
    const gmbService = new GoogleMyBusinessService(GOOGLE_API_KEY)
    const reviewProcessor = new ReviewProcessor(supabase)

    const reviews = await gmbService.fetchReviews(locationId, accessToken)
    const { newReviewsCount, newReviews, skippedReviews } = await reviewProcessor.processReviews(
      reviews, 
      locationId, 
      user.id, 
      forceRefresh
    )

    // Log sync activity
    await supabase
      .from('sync_logs')
      .insert([{
        user_id: user.id,
        location_id: locationId,
        source: 'google_my_business',
        reviews_fetched: reviews.length,
        reviews_added: newReviewsCount,
        sync_date: new Date().toISOString(),
        success: true,
      }])

    return createResponse({
      success: true,
      totalReviews: reviews.length,
      newReviews: newReviewsCount,
      skippedReviews,
      reviews: newReviews,
      requestId
    }, 200, rateLimitHeaders)

  } catch (error) {
    console.error(`[${requestId}] Error processing request:`, error)
    
    // Log failed sync
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '')
        const { data: { user } } = await supabase.auth.getUser(token)
        
        if (user) {
          await supabase
            .from('sync_logs')
            .insert([{
              user_id: user.id,
              source: 'google_my_business',
              sync_date: new Date().toISOString(),
              success: false,
              error_message: error.message,
            }])
        }
      }
    } catch (logError) {
      console.error(`[${requestId}] Failed to log error:`, logError)
    }

    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('401') || error.message.includes('403')) {
        return createErrorResponse('Invalid Google My Business access token', 401, { requestId })
      }
      
      if (error.message.includes('429')) {
        return createErrorResponse('Google My Business API rate limit exceeded', 429, { requestId })
      }
      
      if (error.message.includes('404')) {
        return createErrorResponse('Location not found', 404, { requestId })
      }
    }

    return createErrorResponse(
      'Failed to fetch reviews from Google My Business', 
      500, 
      { 
        requestId,
        ...(Deno.env.get("DENO_ENV") === "development" && { detail: error.message })
      }
    )
  }
})