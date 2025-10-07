import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

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

    const { reviewId, replyText, replySource } = await req.json();

    if (!reviewId || !replyText) {
      throw new Error('Review ID and reply text are required');
    }

    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('*, location_id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single();

    if (reviewError || !review) {
      throw new Error('Review not found or not authorized');
    }

    if (review.replied) {
      throw new Error('This review has already been replied to');
    }

    const { data: googleAccount, error: accountError } = await supabase
      .from('google_accounts')
      .select('access_token, refresh_token, token_expires_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (accountError || !googleAccount) {
      throw new Error('Google account not found. Please reconnect your Google account.');
    }

    let accessToken = googleAccount.access_token;
    const tokenExpiresAt = new Date(googleAccount.token_expires_at);
    const now = new Date();

    if (tokenExpiresAt <= now && googleAccount.refresh_token) {
      console.log('🔄 Token expired, refreshing...');

      const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
      const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID!,
          client_secret: GOOGLE_CLIENT_SECRET!,
          refresh_token: googleAccount.refresh_token,
          grant_type: 'refresh_token'
        })
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(`Token refresh failed: ${tokenData.error_description || tokenData.error}`);
      }

      accessToken = tokenData.access_token;

      const newTokenExpiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

      await supabase
        .from('google_accounts')
        .update({
          access_token: tokenData.access_token,
          token_expires_at: newTokenExpiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }

    console.log('📡 Posting reply to Google for review:', reviewId);
    console.log('📍 Location:', review.location_id);

    const replyResponse = await fetch(
      `https://mybusiness.googleapis.com/v4/${review.location_id}/reviews/${reviewId}/reply`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          comment: replyText
        })
      }
    );

    console.log('📥 Google API response status:', replyResponse.status);

    if (!replyResponse.ok) {
      const errorData = await replyResponse.json();
      console.error('❌ Google API error:', errorData);
      throw new Error(`Google API error (${replyResponse.status}): ${errorData.error?.message || 'Unknown error'}`);
    }

    const googleReplyData = await replyResponse.json();

    const { error: updateError } = await supabase
      .from('reviews')
      .update({
        replied: true,
        reply_content: replyText,
        reply_source: replySource || 'manual',
        replied_at: new Date().toISOString(),
        google_reply_id: googleReplyData.name || null,
        updated_at: new Date().toISOString()
      })
      .eq('review_id', reviewId)
      .eq('user_id', userId);

    if (updateError) {
      console.error('❌ Error updating review in database:', updateError);
    }

    if (replySource !== 'ai') {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01';

      await supabase
        .from('usage_tracking')
        .update({
          manual_replies_count: supabase.sql`manual_replies_count + 1`
        })
        .eq('user_id', userId)
        .eq('month', currentMonth);
    }

    console.log('✅ Successfully posted reply to Google and updated database');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Reply posted successfully',
        reply: googleReplyData
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('❌ Error posting reply:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.stack
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});
