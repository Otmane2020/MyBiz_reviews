import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

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

    const requestBody = await req.json();
    const { action } = requestBody;

    console.log(`🔄 Processing action: ${action}`);

    switch(action) {
      case 'create-post':
        {
          const { locationId, postType, title, content, ctaType, ctaUrl, eventStartDate, eventEndDate, scheduledFor } = requestBody;

          if (!locationId || !content) {
            throw new Error('Location ID and content are required');
          }

          const { data: location, error: locationError } = await supabase
            .from('locations')
            .select('location_id')
            .eq('user_id', userId)
            .eq('location_id', locationId)
            .single();

          if (locationError || !location) {
            throw new Error('Location not found or not authorized');
          }

          const postData = {
            user_id: userId,
            location_id: locationId,
            post_type: postType || 'standard',
            title: title || null,
            content: content,
            cta_type: ctaType || null,
            cta_url: ctaUrl || null,
            event_start_date: eventStartDate || null,
            event_end_date: eventEndDate || null,
            status: scheduledFor ? 'scheduled' : 'draft',
            scheduled_for: scheduledFor || null,
            created_at: new Date().toISOString()
          };

          const { data: newPost, error: insertError } = await supabase
            .from('posts')
            .insert([postData])
            .select()
            .single();

          if (insertError) {
            console.error('❌ Error creating post:', insertError);
            throw new Error(`Failed to create post: ${insertError.message}`);
          }

          console.log('✅ Post created successfully:', newPost.id);

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Post created successfully',
              post: newPost
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

      case 'publish-post':
        {
          const { postId } = requestBody;

          if (!postId) {
            throw new Error('Post ID is required');
          }

          const { data: post, error: postError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .eq('user_id', userId)
            .single();

          if (postError || !post) {
            throw new Error('Post not found or not authorized');
          }

          if (post.status === 'published') {
            throw new Error('Post is already published');
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
          }

          console.log('📡 Publishing post to Google Business Profile...');

          const googlePostBody: any = {
            languageCode: 'fr-FR',
            summary: post.content
          };

          if (post.title) {
            googlePostBody.summary = `${post.title}\n\n${post.content}`;
          }

          if (post.post_type === 'event' && post.event_start_date && post.event_end_date) {
            googlePostBody.event = {
              title: post.title || 'Event',
              schedule: {
                startDate: {
                  year: new Date(post.event_start_date).getFullYear(),
                  month: new Date(post.event_start_date).getMonth() + 1,
                  day: new Date(post.event_start_date).getDate()
                },
                endDate: {
                  year: new Date(post.event_end_date).getFullYear(),
                  month: new Date(post.event_end_date).getMonth() + 1,
                  day: new Date(post.event_end_date).getDate()
                }
              }
            };
          }

          if (post.cta_type && post.cta_url) {
            googlePostBody.callToAction = {
              actionType: post.cta_type,
              url: post.cta_url
            };
          }

          const publishResponse = await fetch(
            `https://mybusinessbusinessinformation.googleapis.com/v1/${post.location_id}/localPosts`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
              },
              body: JSON.stringify(googlePostBody)
            }
          );

          console.log('📥 Google API response status:', publishResponse.status);

          if (!publishResponse.ok) {
            const errorData = await publishResponse.json();
            console.error('❌ Google API error:', errorData);

            await supabase
              .from('posts')
              .update({
                status: 'failed',
                updated_at: new Date().toISOString()
              })
              .eq('id', postId);

            throw new Error(`Failed to publish post: ${errorData.error?.message || 'Unknown error'}`);
          }

          const googlePostData = await publishResponse.json();

          const { error: updateError } = await supabase
            .from('posts')
            .update({
              status: 'published',
              google_post_id: googlePostData.name || null,
              published_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', postId);

          if (updateError) {
            console.error('❌ Error updating post status:', updateError);
          }

          const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
          await supabase
            .from('usage_tracking')
            .update({
              posts_created: supabase.sql`posts_created + 1`
            })
            .eq('user_id', userId)
            .eq('month', currentMonth);

          console.log('✅ Post published successfully');

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Post published successfully',
              googlePost: googlePostData
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

      case 'list-posts':
        {
          const { locationId, status } = requestBody;

          let query = supabase
            .from('posts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (locationId) {
            query = query.eq('location_id', locationId);
          }

          if (status) {
            query = query.eq('status', status);
          }

          const { data: posts, error: postsError } = await query;

          if (postsError) {
            throw new Error(`Failed to fetch posts: ${postsError.message}`);
          }

          return new Response(
            JSON.stringify({
              success: true,
              posts: posts || []
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

      case 'delete-post':
        {
          const { postId } = requestBody;

          if (!postId) {
            throw new Error('Post ID is required');
          }

          const { data: post, error: postError } = await supabase
            .from('posts')
            .select('google_post_id, status')
            .eq('id', postId)
            .eq('user_id', userId)
            .single();

          if (postError || !post) {
            throw new Error('Post not found or not authorized');
          }

          const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', userId);

          if (deleteError) {
            throw new Error(`Failed to delete post: ${deleteError.message}`);
          }

          console.log('✅ Post deleted successfully');

          return new Response(
            JSON.stringify({
              success: true,
              message: 'Post deleted successfully'
            }),
            {
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders
              }
            }
          );
        }

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

  } catch (error) {
    console.error('❌ Error in manage-posts function:', error);
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
