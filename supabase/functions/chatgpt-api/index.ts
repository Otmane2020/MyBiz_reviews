import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    const { 
      review, 
      settings, 
      businessName = 'Notre entreprise' 
    } = await req.json()

    if (!review || !settings) {
      throw new Error('Review and settings are required')
    }

    // Construire le prompt selon les paramètres
    let prompt = `Tu es un assistant IA qui génère des réponses professionnelles aux avis Google My Business.

Avis à traiter:
- Auteur: ${review.author}
- Note: ${review.rating}/5 étoiles
- Commentaire: "${review.comment}"

Paramètres de réponse:
- Ton: ${getToneDescription(settings.tone)}
- Longueur: ${getLengthDescription(settings.responseLength)}
- Entreprise: ${businessName}

${settings.customTemplate ? `Template personnalisé: ${settings.customTemplate}` : ''}

Instructions:
1. Réponds de manière ${settings.tone === 'professional' ? 'professionnelle et formelle' : 
                        settings.tone === 'friendly' ? 'amicale et chaleureuse' : 
                        settings.tone === 'humorous' ? 'avec une pointe d\'humour appropriée' : 
                        'bienveillante et empathique'}
2. ${settings.responseLength === 'S' ? 'Sois concis (20-40 mots)' : 
     settings.responseLength === 'M' ? 'Écris une réponse de longueur moyenne (40-80 mots)' : 
     'Développe une réponse complète (80-150 mots)'}
3. Remercie toujours le client
4. ${review.rating >= 4 ? 'Exprime ta joie et encourage à revenir' : 'Montre de l\'empathie et propose des améliorations'}
5. Ne mentionne pas que tu es une IA
6. Écris en français
7. ${settings.includeSignature ? `Termine par: "${settings.signature.replace('{business_name}', businessName)}"` : 'Pas de signature'}

Génère uniquement la réponse, sans introduction ni explication.`

    // Appel à l'API OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en service client qui génère des réponses authentiques et engageantes aux avis Google My Business.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: settings.responseLength === 'S' ? 100 : settings.responseLength === 'M' ? 200 : 400,
        temperature: settings.tone === 'professional' ? 0.3 : settings.tone === 'humorous' ? 0.8 : 0.6,
      }),
    })

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await openaiResponse.json()
    const generatedResponse = data.choices[0]?.message?.content?.trim()

    if (!generatedResponse) {
      throw new Error('No response generated from OpenAI')
    }

    return new Response(
      JSON.stringify({
        success: true,
        response: generatedResponse,
        usage: data.usage
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )

  } catch (error) {
    console.error('ChatGPT API error:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    )
  }
})

function getToneDescription(tone: string): string {
  switch (tone) {
    case 'professional': return 'Professionnel et formel'
    case 'friendly': return 'Amical et chaleureux'
    case 'humorous': return 'Avec une pointe d\'humour appropriée'
    case 'warm': return 'Bienveillant et empathique'
    default: return 'Amical et chaleureux'
  }
}

function getLengthDescription(length: string): string {
  switch (length) {
    case 'S': return 'Court (20-40 mots)'
    case 'M': return 'Moyen (40-80 mots)'
    case 'L': return 'Long (80-150 mots)'
    default: return 'Moyen (40-80 mots)'
  }
}