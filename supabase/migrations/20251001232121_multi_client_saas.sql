/*
  # Multi-Client SaaS Database Schema

  ## Overview
  This migration transforms the application into a multi-client SaaS platform where each client
  can manage their own Google Business Profile accounts, reviews, posts, and AI-generated responses.

  ## New Tables

  ### 1. `clients`
  Stores business information and subscription details for each client.
  - `id` (uuid, primary key) - References auth.users.id
  - `business_name` (text) - Client's business name
  - `plan_type` (text) - Subscription plan: starter, pro, business
  - `plan_status` (text) - active, trial, cancelled, expired
  - `trial_ends_at` (timestamptz) - End date of trial period
  - `subscription_started_at` (timestamptz) - When subscription started
  - `max_locations` (integer) - Maximum allowed locations based on plan
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `google_accounts`
  Stores OAuth tokens and Google account information per client.
  - `id` (bigint, primary key)
  - `user_id` (uuid) - References auth.users.id
  - `account_id` (text) - Google My Business account ID
  - `account_name` (text) - Google account display name
  - `access_token` (text, encrypted) - Google OAuth access token
  - `refresh_token` (text, encrypted) - Google OAuth refresh token
  - `token_expires_at` (timestamptz) - When access token expires
  - `scopes` (text[]) - Granted OAuth scopes
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. `locations`
  Stores Google Business locations managed by each client.
  - `id` (bigint, primary key)
  - `user_id` (uuid) - References auth.users.id
  - `google_account_id` (bigint) - References google_accounts.id
  - `location_id` (text) - Google location ID
  - `location_name` (text) - Business location name
  - `address` (text) - Full address
  - `category` (text) - Primary category
  - `is_active` (boolean) - Whether location is actively managed
  - `last_synced_at` (timestamptz) - Last time reviews were synced
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. `posts`
  Stores Google Business posts created by clients.
  - `id` (bigint, primary key)
  - `user_id` (uuid) - References auth.users.id
  - `location_id` (text) - Google location ID
  - `google_post_id` (text) - Google's post ID after publication
  - `post_type` (text) - standard, event, offer
  - `title` (text) - Post title
  - `content` (text) - Post content
  - `cta_type` (text) - Call to action type (BOOK, ORDER, etc.)
  - `cta_url` (text) - Call to action URL
  - `media_urls` (text[]) - Array of image/video URLs
  - `event_start_date` (date) - For event posts
  - `event_end_date` (date) - For event posts
  - `status` (text) - draft, scheduled, published, failed
  - `scheduled_for` (timestamptz) - When to publish
  - `published_at` (timestamptz) - When it was published
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 5. `usage_tracking`
  Tracks API usage and quotas per client per month.
  - `id` (bigint, primary key)
  - `user_id` (uuid) - References auth.users.id
  - `month` (date) - Tracking month (YYYY-MM-01)
  - `ai_replies_used` (integer) - Number of AI replies generated
  - `ai_replies_limit` (integer) - Monthly limit based on plan
  - `manual_replies_count` (integer) - Manual replies posted
  - `posts_created` (integer) - Posts created this month
  - `reviews_synced` (integer) - Reviews synced this month
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 6. Updates to `reviews` table
  - Add `user_id` (uuid) - References auth.users.id
  - Add `reply_content` (text) - The reply text if replied
  - Add `reply_source` (text) - manual, ai, or null
  - Add `replied_at` (timestamptz) - When reply was posted
  - Add `google_reply_id` (text) - Google's reply ID

  ## Security (RLS Policies)
  - All tables have Row Level Security enabled
  - Users can only read/write their own data
  - Service role bypasses RLS for system operations

  ## Indexes
  - Indexes on user_id for all tables for fast filtering
  - Indexes on location_id for reviews and posts
  - Indexes on dates for time-based queries
  - Composite indexes for common query patterns
*/

-- =============================================
-- 1. CREATE NEW TABLES
-- =============================================

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text,
  plan_type text NOT NULL DEFAULT 'starter' CHECK (plan_type IN ('starter', 'pro', 'business')),
  plan_status text NOT NULL DEFAULT 'trial' CHECK (plan_status IN ('active', 'trial', 'cancelled', 'expired')),
  trial_ends_at timestamptz DEFAULT (now() + interval '14 days'),
  subscription_started_at timestamptz DEFAULT now(),
  max_locations integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Google accounts table
CREATE TABLE IF NOT EXISTS google_accounts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id text NOT NULL,
  account_name text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, account_id)
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_account_id bigint REFERENCES google_accounts(id) ON DELETE CASCADE,
  location_id text NOT NULL,
  location_name text NOT NULL,
  address text,
  category text,
  is_active boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, location_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id text NOT NULL,
  google_post_id text,
  post_type text NOT NULL DEFAULT 'standard' CHECK (post_type IN ('standard', 'event', 'offer')),
  title text,
  content text NOT NULL,
  cta_type text CHECK (cta_type IN ('BOOK', 'ORDER', 'SHOP', 'LEARN_MORE', 'SIGN_UP', 'CALL')),
  cta_url text,
  media_urls text[] DEFAULT '{}',
  event_start_date date,
  event_end_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month date NOT NULL,
  ai_replies_used integer DEFAULT 0,
  ai_replies_limit integer NOT NULL DEFAULT 50,
  manual_replies_count integer DEFAULT 0,
  posts_created integer DEFAULT 0,
  reviews_synced integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month)
);

-- =============================================
-- 2. UPDATE EXISTING REVIEWS TABLE
-- =============================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'reply_content'
  ) THEN
    ALTER TABLE reviews ADD COLUMN reply_content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'reply_source'
  ) THEN
    ALTER TABLE reviews ADD COLUMN reply_source text CHECK (reply_source IN ('manual', 'ai'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'replied_at'
  ) THEN
    ALTER TABLE reviews ADD COLUMN replied_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'google_reply_id'
  ) THEN
    ALTER TABLE reviews ADD COLUMN google_reply_id text;
  END IF;
END $$;

-- =============================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Clients indexes
CREATE INDEX IF NOT EXISTS idx_clients_plan_status ON clients (plan_status);
CREATE INDEX IF NOT EXISTS idx_clients_trial_ends ON clients (trial_ends_at);

-- Google accounts indexes
CREATE INDEX IF NOT EXISTS idx_google_accounts_user_id ON google_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_google_accounts_token_expires ON google_accounts (token_expires_at);

-- Locations indexes
CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations (user_id);
CREATE INDEX IF NOT EXISTS idx_locations_location_id ON locations (location_id);
CREATE INDEX IF NOT EXISTS idx_locations_is_active ON locations (is_active);
CREATE INDEX IF NOT EXISTS idx_locations_user_active ON locations (user_id, is_active);

-- Posts indexes
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts (user_id);
CREATE INDEX IF NOT EXISTS idx_posts_location_id ON posts (location_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts (status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_for ON posts (scheduled_for);
CREATE INDEX IF NOT EXISTS idx_posts_user_status ON posts (user_id, status);

-- Usage tracking indexes
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking (user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month ON usage_tracking (month);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking (user_id, month);

-- Reviews indexes (additional)
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_location ON reviews (user_id, location_id);
CREATE INDEX IF NOT EXISTS idx_reviews_replied ON reviews (replied);

-- =============================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. CREATE RLS POLICIES
-- =============================================

-- Clients policies
DROP POLICY IF EXISTS "Users can view own client data" ON clients;
CREATE POLICY "Users can view own client data"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own client data" ON clients;
CREATE POLICY "Users can insert own client data"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own client data" ON clients;
CREATE POLICY "Users can update own client data"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Google accounts policies
DROP POLICY IF EXISTS "Users can view own google accounts" ON google_accounts;
CREATE POLICY "Users can view own google accounts"
  ON google_accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own google accounts" ON google_accounts;
CREATE POLICY "Users can insert own google accounts"
  ON google_accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own google accounts" ON google_accounts;
CREATE POLICY "Users can update own google accounts"
  ON google_accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own google accounts" ON google_accounts;
CREATE POLICY "Users can delete own google accounts"
  ON google_accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Locations policies
DROP POLICY IF EXISTS "Users can view own locations" ON locations;
CREATE POLICY "Users can view own locations"
  ON locations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own locations" ON locations;
CREATE POLICY "Users can insert own locations"
  ON locations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own locations" ON locations;
CREATE POLICY "Users can update own locations"
  ON locations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own locations" ON locations;
CREATE POLICY "Users can delete own locations"
  ON locations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Posts policies
DROP POLICY IF EXISTS "Users can view own posts" ON posts;
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own posts" ON posts;
CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Usage tracking policies
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage"
  ON usage_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON usage_tracking;
CREATE POLICY "Users can insert own usage"
  ON usage_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON usage_tracking;
CREATE POLICY "Users can update own usage"
  ON usage_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Reviews policies (update existing)
DROP POLICY IF EXISTS "Authenticated users can read all reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can update reviews" ON reviews;

CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 6. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to get or create usage tracking for current month
CREATE OR REPLACE FUNCTION get_or_create_usage_tracking(p_user_id uuid)
RETURNS usage_tracking AS $$
DECLARE
  v_month date;
  v_usage usage_tracking;
  v_ai_limit integer;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::date;

  -- Get AI limit based on user's plan
  SELECT CASE
    WHEN plan_type = 'starter' THEN 50
    WHEN plan_type = 'pro' THEN 300
    WHEN plan_type = 'business' THEN 1000
    ELSE 50
  END INTO v_ai_limit
  FROM clients
  WHERE id = p_user_id;

  -- Get or create usage tracking
  INSERT INTO usage_tracking (user_id, month, ai_replies_limit)
  VALUES (p_user_id, v_month, COALESCE(v_ai_limit, 50))
  ON CONFLICT (user_id, month) DO UPDATE
  SET ai_replies_limit = COALESCE(v_ai_limit, 50)
  RETURNING * INTO v_usage;

  RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can use AI reply
CREATE OR REPLACE FUNCTION can_use_ai_reply(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_usage usage_tracking;
BEGIN
  v_usage := get_or_create_usage_tracking(p_user_id);
  RETURN v_usage.ai_replies_used < v_usage.ai_replies_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment AI reply usage
CREATE OR REPLACE FUNCTION increment_ai_reply_usage(p_user_id uuid)
RETURNS void AS $$
DECLARE
  v_month date;
BEGIN
  v_month := date_trunc('month', CURRENT_DATE)::date;

  UPDATE usage_tracking
  SET ai_replies_used = ai_replies_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id AND month = v_month;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check location limit based on plan
CREATE OR REPLACE FUNCTION can_add_location(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_max_locations integer;
  v_current_count integer;
BEGIN
  -- Get max locations from client plan
  SELECT max_locations INTO v_max_locations
  FROM clients
  WHERE id = p_user_id;

  -- Count current active locations
  SELECT COUNT(*) INTO v_current_count
  FROM locations
  WHERE user_id = p_user_id AND is_active = true;

  RETURN v_current_count < COALESCE(v_max_locations, 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_google_accounts_updated_at ON google_accounts;
CREATE TRIGGER update_google_accounts_updated_at
  BEFORE UPDATE ON google_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 8. ENABLE REALTIME FOR NEW TABLES
-- =============================================

ALTER PUBLICATION supabase_realtime ADD TABLE clients;
ALTER PUBLICATION supabase_realtime ADD TABLE locations;
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE usage_tracking;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================
