/*
  # Create AI Settings Table

  1. New Tables
    - `ai_settings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `enabled` (boolean) - Activer/désactiver les réponses automatiques
      - `tone` (text) - Ton de réponse (amical et professionnel, formel et poli, etc.)
      - `style` (text) - Style de réponse (chaleureux et naturel, etc.)
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

-- Create ai_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS ai_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  tone text DEFAULT 'amical et professionnel',
  style text DEFAULT 'chaleureux et naturel',
  response_length text DEFAULT 'M',
  include_signature boolean DEFAULT true,
  signature text DEFAULT '— L''équipe Starlinko',
  custom_template text DEFAULT '',
  auto_reply_delay integer DEFAULT 5,
  only_positive_reviews boolean DEFAULT false,
  minimum_rating integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Add style column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_settings' AND column_name = 'style'
  ) THEN
    ALTER TABLE ai_settings ADD COLUMN style text DEFAULT 'chaleureux et naturel';
  END IF;
END $$;

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view own AI settings" ON ai_settings;
  DROP POLICY IF EXISTS "Users can insert own AI settings" ON ai_settings;
  DROP POLICY IF EXISTS "Users can update own AI settings" ON ai_settings;
  DROP POLICY IF EXISTS "Users can delete own AI settings" ON ai_settings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Policies for authenticated users
CREATE POLICY "Users can view own AI settings"
  ON ai_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own AI settings"
  ON ai_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own AI settings"
  ON ai_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own AI settings"
  ON ai_settings FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS ai_settings_updated_at ON ai_settings;

CREATE TRIGGER ai_settings_updated_at
  BEFORE UPDATE ON ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_settings_updated_at();
