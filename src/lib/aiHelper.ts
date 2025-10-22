export interface AISettings {
  enabled: boolean;
  tone: 'professional' | 'friendly' | 'humorous' | 'warm';
  responseLength: 'S' | 'M' | 'L';
  includeSignature: boolean;
  signature: string;
  customTemplate: string;
  autoReplyDelay: number;
  onlyPositiveReviews: boolean;
  minimumRating: number;
}

export interface DeepSeekPayload {
  review_text: string;
  rating: number;
  author: string;
  business_name: string;
  tone?: string;
  style?: string;
  signature?: string;
  response_length?: string;
  debug?: boolean;
}

const toneMapping = {
  professional: "professionnel et formel",
  friendly: "amical et chaleureux",
  humorous: "léger avec une pointe d'humour",
  warm: "bienveillant et empathique"
};

const styleMapping = {
  professional: "réponse formelle, structurée, sans familiarité",
  friendly: "réponse naturelle, fluide, chaleureuse",
  humorous: "réponse légère, positive, avec une touche d'originalité",
  warm: "réponse empathique, proche du client, sincère"
};

export function mapSettingsToDeepSeekPayload(
  reviewText: string,
  rating: number,
  author: string,
  businessName: string,
  settings: AISettings
): DeepSeekPayload {
  return {
    review_text: reviewText,
    rating,
    author,
    business_name: businessName,
    tone: toneMapping[settings.tone],
    style: styleMapping[settings.tone],
    signature: settings.includeSignature
      ? settings.signature.replace('{business_name}', businessName)
      : undefined,
    response_length: settings.responseLength
  };
}

export async function callZapierWebhook(payload: DeepSeekPayload): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const apiUrl = `${supabaseUrl}/functions/v1/zapier-webhook`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Erreur lors de la génération de la réponse');
  }

  return data.reply;
}

export async function loadAISettings(userId: string, supabase: any): Promise<AISettings | null> {
  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('seller_id', userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    enabled: data.enabled,
    tone: data.tone,
    responseLength: data.response_length,
    includeSignature: data.include_signature,
    signature: data.signature,
    customTemplate: data.custom_template,
    autoReplyDelay: data.auto_reply_delay,
    onlyPositiveReviews: data.only_positive_reviews,
    minimumRating: data.minimum_rating
  };
}
