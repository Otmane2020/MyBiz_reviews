/*
  # Add ai_reply column to reviews table

  1. Changes
    - Add `ai_reply` column (text, nullable) to store AI-generated replies
    
  2. Notes
    - This column stores the AI-generated reply text
    - Separate from reply_content which stores actual published replies
*/

-- Add ai_reply column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'ai_reply'
  ) THEN
    ALTER TABLE reviews ADD COLUMN ai_reply text;
  END IF;
END $$;
