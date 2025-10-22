/*
  # Fix Google Auth Profile Creation
  
  ## Overview
  Updates the user creation trigger to also create a profile entry
  
  ## Changes
  1. Updates handle_new_user() function to:
     - Create clients entry (existing)
     - Create profiles entry with data from Google OAuth
     - Initialize usage tracking (existing)
  
  ## Security
  - Maintains SECURITY DEFINER for RLS bypass
  - Extracts user metadata from OAuth providers
*/

-- Update function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new client profile with default starter plan
  INSERT INTO clients (
    id,
    business_name,
    plan_type,
    plan_status,
    trial_ends_at,
    subscription_started_at,
    max_locations
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'starter',
    'trial',
    now() + interval '14 days',
    now(),
    1
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create profile entry
  INSERT INTO profiles (
    id,
    email,
    full_name,
    avatar_url
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;

  -- Initialize usage tracking for current month
  INSERT INTO usage_tracking (
    user_id,
    month,
    ai_replies_used,
    ai_replies_limit,
    manual_replies_count,
    posts_created,
    reviews_synced
  ) VALUES (
    NEW.id,
    date_trunc('month', CURRENT_DATE)::date,
    0,
    50,
    0,
    0,
    0
  )
  ON CONFLICT (user_id, month) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
