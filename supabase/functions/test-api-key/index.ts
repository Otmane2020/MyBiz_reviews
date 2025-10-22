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
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY") || Deno.env.get("GOOGLE_API_KEY");
    const allEnvVars = Deno.env.toObject();
    const googleKeys = Object.keys(allEnvVars).filter(key => key.includes('GOOGLE'));

    return new Response(JSON.stringify({
      success: true,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET',
      availableGoogleKeys: googleKeys,
      message: apiKey ? 'API Key is configured!' : 'API Key is NOT configured. Please add GOOGLE_MAPS_API_KEY secret in Supabase.'
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });

  } catch (error) {
    console.error("Error:", error);

    return new Response(JSON.stringify({
      error: error.message || "Internal server error",
      success: false
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});
