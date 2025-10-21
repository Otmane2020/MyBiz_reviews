/*
  # Create AI Settings Table

  1. New Tables
    - `ai_settings`
      - `id` (uuid, primary key)
      - `seller_id` (uuid, foreign key to client_profiles)
      - `enabled` (boolean) - Activer/désactiver les réponses automatiques
      - `tone` (text) - Ton de réponse (professional, friendly, humorous, warm)
      - `response_length` (text) - Longueur de réponse (S, M, L)
      - `include_signature` (boolean) - Inclure une signature
      - `signature` (text) - Texte de signature personnalisé
      - `custom_template` (text) - Template personnalisé optionnel
      - `auto_reply_delay` (integer) - Délai avant réponse automatique en minutes
      - `only_positive_reviews` (boolean) - Répondre seulement aux avis positifs
      - `minimum_rating` (integer) - Note minimum pour réponse automatique
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `ai_settings` table
    - Add policies for authenticated users to manage their own settings
*/

-- Create ai_settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  tone text DEFAULT 'friendly',
  response_length text DEFAULT 'M',
  include_signature boolean DEFAULT true,
  signature text DEFAULT 'L''équipe {business_name}',
  custom_template text DEFAULT '',
  auto_reply_delay integer DEFAULT 5,
  only_positive_reviews boolean DEFAULT false,
  minimum_rating integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(seller_id)
);

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Users can view own AI settings"
  ON ai_settings FOR SELECT
  TO authenticated
  USING (seller_id = auth.uid());

CREATE POLICY "Users can insert own AI settings"
  ON ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can update own AI settings"
  ON ai_settings FOR UPDATE
  TO authenticated
  USING (seller_id = auth.uid())
  WITH CHECK (seller_id = auth.uid());

CREATE POLICY "Users can delete own AI settings"
  ON ai_settings FOR DELETE
  TO authenticated
  USING (seller_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();
