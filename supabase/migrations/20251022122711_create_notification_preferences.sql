/*
  # Create Notification Preferences Table

  1. New Tables
    - `notification_preferences`
      - `id` (bigint, primary key, auto-increment)
      - `user_id` (uuid, foreign key to auth.users)
      - `email_enabled` (boolean, default true) - Enable/disable email notifications
      - `push_enabled` (boolean, default true) - Enable/disable push notifications
      - `notify_new_review` (boolean, default true) - Notify on new reviews
      - `notify_low_rating` (boolean, default true) - Notify on ratings below threshold
      - `low_rating_threshold` (integer, default 3) - Rating threshold for notifications
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `notification_preferences` table
    - Add policies for users to manage their own preferences
*/

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  push_enabled boolean DEFAULT true,
  notify_new_review boolean DEFAULT true,
  notify_low_rating boolean DEFAULT true,
  low_rating_threshold integer DEFAULT 3,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;
