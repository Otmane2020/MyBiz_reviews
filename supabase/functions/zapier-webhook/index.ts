import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Zapier webhook endpoint is ready",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { review_text, rating, author, business_name } = body;

      if (!review_text) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "review_text is required",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");

      if (!DEEPSEEK_API_KEY) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "DeepSeek API key not configured",
          }),
          {
            status: 500,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const prompt = `Tu es un assistant qui répond aux avis Google My Business pour ${business_name || "un établissement"}.

Avis reçu:
- Auteur: ${author || "Client"}
- Note: ${rating || "N/A"}/5
- Commentaire: "${review_text}"

Génère une réponse professionnelle, chaleureuse et personnalisée en français. La réponse doit:
- Remercier le client
- Être adaptée à la note (positive, neutre ou négative)
- Être concise (2-4 phrases maximum)
- Être naturelle et authentique

Réponds UNIQUEMENT avec le texte de la réponse, sans guillemets ni formatage.`;

      const deepseekResponse = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "Tu es un assistant professionnel qui génère des réponses aux avis clients.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      if (!deepseekResponse.ok) {
        const errorText = await deepseekResponse.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API error: ${deepseekResponse.statusText}`);
      }

      const aiData = await deepseekResponse.json();
      const aiReply = aiData.choices?.[0]?.message?.content?.trim() || "";

      return new Response(
        JSON.stringify({
          success: true,
          reply: aiReply,
          usage: aiData.usage,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Method not allowed",
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Zapier webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
