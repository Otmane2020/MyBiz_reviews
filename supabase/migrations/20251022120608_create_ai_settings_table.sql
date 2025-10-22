/*
  # Create AI Settings Table

  1. New Tables
    - `ai_settings`
      - `id` (bigint, primary key, auto-increment)
      - `user_id` (uuid, foreign key to auth.users)
      - `enabled` (boolean, default true)
      - `tone` (text, default 'amical et professionnel')
      - `style` (text, default 'chaleureux et naturel')
      - `response_length` (text, default 'M')
      - `include_signature` (boolean, default true)
      - `signature` (text, default '— L''équipe')
      - `custom_template` (text, nullable)
      - `auto_reply_delay` (integer, default 5)
      - `only_positive_reviews` (boolean, default false)
      - `minimum_rating` (integer, default 3)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `ai_settings` table
    - Add policies for users to manage their own settings
*/

-- Create ai_settings table
CREATE TABLE IF NOT EXISTS ai_settings (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT true,
  tone text DEFAULT 'amical et professionnel',
  style text DEFAULT 'chaleureux et naturel',
  response_length text DEFAULT 'M',
  include_signature boolean DEFAULT true,
  signature text DEFAULT '— L''équipe',
  custom_template text,
  auto_reply_delay integer DEFAULT 5,
  only_positive_reviews boolean DEFAULT false,
  minimum_rating integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own AI settings"
  ON ai_settings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI settings"
  ON ai_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI settings"
  ON ai_settings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI settings"
  ON ai_settings
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
