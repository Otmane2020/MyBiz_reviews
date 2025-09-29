/*
  # Create Stripe integration tables

  1. New Tables
    - `stripe_sessions`
      - `id` (uuid, primary key)
      - `session_id` (text, unique)
      - `user_id` (uuid, foreign key to profiles)
      - `plan_id` (text)
      - `billing_cycle` (text)
      - `price_id` (text)
      - `status` (text)
      - `stripe_customer_id` (text)
      - `stripe_subscription_id` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Profile Updates
    - Add Stripe-related columns to profiles table

  3. Security
    - Enable RLS on stripe_sessions table
    - Add policies for authenticated users
*/

-- Create stripe_sessions table
CREATE TABLE IF NOT EXISTS stripe_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text UNIQUE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id text NOT NULL,
  billing_cycle text DEFAULT 'monthly',
  price_id text NOT NULL,
  status text DEFAULT 'pending',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add Stripe columns to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_customer_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'stripe_subscription_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN stripe_subscription_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'plan_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN plan_id text DEFAULT 'starter';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_cycle text DEFAULT 'monthly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'trial_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN trial_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_period_start'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_period_start timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE profiles ADD COLUMN current_period_end timestamptz;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE stripe_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own stripe sessions"
  ON stripe_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = uid());

CREATE POLICY "Users can insert own stripe sessions"
  ON stripe_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = uid());

CREATE POLICY "Service role can manage all stripe sessions"
  ON stripe_sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_user_id ON stripe_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_session_id ON stripe_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_sessions_subscription_id ON stripe_sessions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);