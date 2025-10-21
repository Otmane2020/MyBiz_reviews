import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    // ✅ Test simple GET
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

    // ✅ Traitement du POST
    if (req.method === "POST") {
      const body = await req.json();
      const { review_text, rating, author, business_name, debug } = body;

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

      // 🧠 Prompt amélioré avec signature Starlinko
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
3. Répondre en 2 à 4 phrases maximum.
4. Être naturel, positif et professionnel.
5. Terminer par : "— L’équipe Starlinko".

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

      // 👀 Debug complet
      console.log("🧩 DeepSeek response:", data);

      // Récupération propre de la réponse IA
      let aiReply = data?.choices?.[0]?.message?.content?.trim() || "";

      // Si vide → message d’erreur explicite
      if (!aiReply) {
        aiReply =
          "⚠️ Erreur : aucune réponse générée par l’IA. Vérifie ta clé DeepSeek ou réessaie plus tard.";
      }

      const responseJson = {
        success: true,
        reply: aiReply,
        debug: debug ? data : undefined, // renvoie les logs si debug:true
        timestamp: new Date().toISOString(),
      };

      return new Response(JSON.stringify(responseJson), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ❌ Méthode non autorisée
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
