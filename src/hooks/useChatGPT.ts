import { useState } from 'react';

interface Review {
  author: string;
  rating: number;
  comment: string;
}

interface AISettings {
  enabled: boolean;
  tone: 'professional' | 'friendly' | 'humorous' | 'warm';
  responseLength: 'S' | 'M' | 'L';
  includeSignature: boolean;
  signature: string;
  customTemplate: string;
}

interface ChatGPTResponse {
  success: boolean;
  response?: string;
  error?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export const useChatGPT = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateResponse = async (
    review: Review,
    settings: AISettings,
    businessName: string = 'Notre entreprise'
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration Supabase manquante');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/chatgpt-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          review,
          settings,
          businessName,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatGPTResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la génération de la réponse');
      }

      return data.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      console.error('ChatGPT API error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateBulkResponses = async (
    reviews: Review[],
    settings: AISettings,
    businessName: string = 'Notre entreprise'
  ): Promise<{ review: Review; response: string | null }[]> => {
    const results = [];
    
    for (const review of reviews) {
      const response = await generateResponse(review, settings, businessName);
      results.push({ review, response });
      
      // Petit délai pour éviter de surcharger l'API DeepSeek
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return results;
  };

  return {
    generateResponse,
    generateBulkResponses,
    loading,
    error,
  };
}