import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
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
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }

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

    const { reviewText, rating, reviewerName, businessName } = await req.json();

    if (!reviewText || !rating) {
      throw new Error('Review text and rating are required');
    }

    const canUse = await supabase.rpc('can_use_ai_reply', { p_user_id: userId });

    if (!canUse.data) {
      const { data: usage } = await supabase
        .from('usage_tracking')
        .select('ai_replies_used, ai_replies_limit')
        .eq('user_id', userId)
        .eq('month', new Date().toISOString().slice(0, 7) + '-01')
        .single();

      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI reply limit reached',
          usage: usage
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    console.log('🤖 Generating AI reply for review with rating:', rating);

    const ratingText = rating >= 4 ? 'positive' : rating === 3 ? 'neutral' : 'negative';

    const systemPrompt = `Tu es un assistant spécialisé dans la gestion de la réputation en ligne pour des établissements locaux.
Ta tâche est de générer des réponses professionnelles, empathiques et personnalisées aux avis clients Google.

Directives:
- Sois sincère, chaleureux et professionnel
- Adapte ton ton selon la note (positive, neutre, négative)
- Pour les avis positifs (4-5 étoiles): remercie chaleureusement et encourage à revenir
- Pour les avis neutres (3 étoiles): remercie, montre de l'empathie et propose des améliorations
- Pour les avis négatifs (1-2 étoiles): présente des excuses sincères, montre de l'empathie, propose une solution
- Garde la réponse courte (2-4 phrases maximum)
- N'utilise jamais d'emojis
- Personnalise avec le nom du client si fourni
- Mentionne le nom de l'établissement si fourni
- Reste positif et constructif même face à une critique`;

    const userPrompt = `Génère une réponse professionnelle pour cet avis ${ratingText}:

Avis: "${reviewText}"
Note: ${rating}/5
${reviewerName ? `Client: ${reviewerName}` : ''}
${businessName ? `Établissement: ${businessName}` : ''}

Génère uniquement la réponse, sans guillemets ni préambule.`;

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 200,
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json();
      console.error('❌ DeepSeek API error:', errorData);
      throw new Error(`DeepSeek API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const deepseekData = await deepseekResponse.json();
    const generatedReply = deepseekData.choices[0].message.content.trim();

    console.log('✅ Generated AI reply:', generatedReply);

    await supabase.rpc('increment_ai_reply_usage', { p_user_id: userId });

    return new Response(
      JSON.stringify({
        success: true,
        reply: generatedReply,
        source: 'ai'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );

  } catch (error) {
    console.error('❌ Error generating AI reply:', error);
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
