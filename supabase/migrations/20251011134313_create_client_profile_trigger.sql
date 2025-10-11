/*
  # Auto-Create Client Profile on User Signup

  ## Overview
  This migration creates a trigger that automatically creates a client profile
  when a new user signs up in the auth.users table.

  ## Changes
  1. Function: `handle_new_user()`
     - Automatically creates a client profile with default values
     - Sets plan_type to 'starter'
     - Sets plan_status to 'trial'
     - Sets trial period to 14 days
     - Sets max_locations to 1
  
  2. Trigger: `on_auth_user_created`
     - Fires after INSERT on auth.users
     - Calls handle_new_user() function

  ## Security
  - Function runs with SECURITY DEFINER to bypass RLS
  - Only creates client profile, doesn't modify auth data
*/

-- Function to handle new user creation
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
  );

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
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();