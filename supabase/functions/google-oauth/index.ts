import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    console.log("🚀 Google OAuth function called");
    
    const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
    const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
    
    console.log("🔑 Environment check:", {
      hasClientId: !!GOOGLE_CLIENT_ID,
      hasClientSecret: !!GOOGLE_CLIENT_SECRET
    });

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      return new Response(JSON.stringify({
        error: "Configuration Google OAuth manquante",
        success: false
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    const requestData = await req.json();
    const { action } = requestData;
    
    console.log("🎯 Action requested:", action);

    if (action === "get-auth-url") {
      const { redirectUri } = requestData;
      
      if (!redirectUri) {
        return new Response(JSON.stringify({
          error: "redirectUri requis",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
      ].join(" ");

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: scopes,
        access_type: "offline",
        prompt: "consent"
      });

      return new Response(JSON.stringify({
        authUrl,
        success: true
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    if (action === "exchange-code") {
      const { code, redirectUri } = requestData;
      
      if (!code || !redirectUri) {
        return new Response(JSON.stringify({
          error: "Code et redirectUri requis",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("🔄 Exchanging code for tokens");
      
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri
        })
      });

      const tokens = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        console.error("❌ Token exchange failed:", tokens);
        return new Response(JSON.stringify({
          error: `Échec de l'échange de token: ${tokens.error_description || tokens.error}`,
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      const userResponse = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });

      const userData = await userResponse.json();
      
      if (!userResponse.ok) {
        console.error("❌ Failed to get user info:", userData);
        return new Response(JSON.stringify({
          error: "Échec de la récupération des informations utilisateur",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("✅ OAuth exchange successful");
      
      return new Response(JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
        user: userData,
        success: true
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    if (action === "get-accounts") {
      const { accessToken } = requestData;
      
      if (!accessToken) {
        return new Response(JSON.stringify({
          error: "Access token requis",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("🏢 Getting Google Business Profile accounts");
      
      const accountsResponse = await fetch("https://mybusinessbusinessinformation.googleapis.com/v1/accounts", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      const accountsData = await accountsResponse.json();
      
      if (!accountsResponse.ok) {
        console.error("❌ Accounts API error:", accountsData);
        return new Response(JSON.stringify({
          error: accountsData.error?.message || "Erreur lors de la récupération des comptes",
          success: false
        }), {
          status: accountsResponse.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("✅ Accounts retrieved successfully");
      
      return new Response(JSON.stringify({
        accounts: accountsData.accounts || [],
        success: true
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    if (action === "get-locations") {
      const { accessToken, accountId } = requestData;
      
      if (!accessToken || !accountId) {
        return new Response(JSON.stringify({
          error: "Access token et accountId requis",
          success: false
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("🏪 Getting locations for account:", accountId);
      
      const locationsResponse = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountId}/locations?readMask=name,title,storeCode,metadata,profile,locationKey,labels,regularHours,specialHours,serviceArea,adWordsLocationExtensions,latlng,openInfo,phoneNumbers,relationshipData,moreHours,serviceItems,profile,metadata`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      const locationsData = await locationsResponse.json();
      
      if (!locationsResponse.ok) {
        console.error("❌ Locations API error:", locationsData);
        return new Response(JSON.stringify({
          error: locationsData.error?.message || "Erreur lors de la récupération des établissements",
          success: false
        }), {
          status: locationsResponse.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders
          }
        });
      }

      console.log("✅ Locations retrieved successfully");
      
      return new Response(JSON.stringify({
        locations: locationsData.locations || [],
        success: true
      }), {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }

    return new Response(JSON.stringify({
      error: `Action non supportée: ${action}`,
      success: false
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("💥 Unexpected error:", error);
    
    return new Response(JSON.stringify({
      error: error.message || "Erreur interne du serveur",
      success: false
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});