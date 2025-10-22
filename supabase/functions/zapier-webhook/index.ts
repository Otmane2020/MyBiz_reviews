import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method === "GET") {
      return new Response(
        JSON.stringify({
          status: "ok",
          message: "Zapier webhook endpoint is ready (public)",
          timestamp: new Date().toISOString(),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const {
        review_text,
        rating,
        author,
        business_name,
        user_id,
        seller_id,
        tone,
        style,
        signature,
        response_length,
        debug
      } = body;

      if (!review_text) {
        return new Response(
          JSON.stringify({ success: false, error: "review_text is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY");
      if (!DEEPSEEK_API_KEY) {
        return new Response(
          JSON.stringify({ success: false, error: "DeepSeek API key not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      let toneValue = tone || "amical et professionnel";
      let styleValue = style || "chaleureux et naturel";
      let signatureValue = signature || "— L'équipe Starlinko";
      let lengthValue = response_length || "M";

      const userId = user_id || seller_id;
      if (userId) {
        try {
          const supabaseUrl = Deno.env.get("SUPABASE_URL");
          const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

          if (supabaseUrl && supabaseServiceKey) {
            const supabase = createClient(supabaseUrl, supabaseServiceKey);

            const { data: settings } = await supabase
              .from("ai_settings")
              .select("*")
              .eq("user_id", userId)
              .maybeSingle();

            if (settings) {
              toneValue = settings.tone || toneValue;
              styleValue = settings.style || styleValue;
              signatureValue = settings.signature || signatureValue;
              lengthValue = settings.response_length || lengthValue;
            }
          }
        } catch (error) {
          console.error("Error loading AI settings:", error);
        }
      }

      let lengthInstruction = "2 à 4 phrases maximum";
      if (lengthValue === "S") {
        lengthInstruction = "1 à 2 phrases courtes (20-40 mots)";
      } else if (lengthValue === "M") {
        lengthInstruction = "2 à 4 phrases (40-80 mots)";
      } else if (lengthValue === "L") {
        lengthInstruction = "4 à 6 phrases (80-150 mots)";
      }

      const prompt = `Tu es un assistant professionnel qui répond aux avis Google My Business pour ${
        business_name || "un établissement"
      }.

Avis reçu :
- Auteur : ${author || "Client"}
- Note : ${rating || "N/A"}/5
- Commentaire : "${review_text}"

Ta mission :
1. Remercier le client.
2. Adapter le ton selon la note.
3. Répondre en ${lengthInstruction}.
4. Utiliser un ton : ${toneValue}.
5. Style de réponse : ${styleValue}.
6. Terminer par : "${signatureValue}".

Réponds uniquement avec le texte de la réponse, sans guillemets, ni balises.`;

      const deepseekResponse = await fetch(
        "https://api.deepseek.com/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              {
                role: "system",
                content:
                  "Tu es un assistant IA qui rédige des réponses aux avis Google de manière polie et naturelle.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.8,
            max_tokens: 250,
          }),
        },
      );

      const data = await deepseekResponse.json();

      console.log("🧩 DeepSeek response:", data);

      let aiReply = data?.choices?.[0]?.message?.content?.trim() || "";

      if (!aiReply) {
        aiReply =
          "⚠️ Erreur : aucune réponse générée par l'IA. Vérifie ta clé DeepSeek ou réessaie plus tard.";
      }

      const responseJson = {
        success: true,
        reply: aiReply,
        settings_used: {
          tone: toneValue,
          style: styleValue,
          signature: signatureValue,
          response_length: lengthValue
        },
        debug: debug ? data : undefined,
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(responseJson), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Zapier webhook error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
