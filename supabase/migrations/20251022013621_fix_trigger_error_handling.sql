/*
  # Fix trigger error handling for new user creation

  This migration improves the robustness of the user creation trigger by:
  1. Adding proper error handling with exception blocks
  2. Ensuring the trigger doesn't fail the auth process if profile creation has issues
  3. Adding detailed logging for debugging
  
  ## Changes
  - Replace the handle_new_user function with better error handling
  - Wrap each INSERT in its own exception block
  - Return NEW even if inserts fail (don't block auth)
*/

-- Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert new client profile with default starter plan
  BEGIN
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
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create client for user %: %', NEW.id, SQLERRM;
  END;

  -- Create profile entry
  BEGIN
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
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  END;

  -- Initialize usage tracking for current month
  BEGIN
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
  EXCEPTION 
    WHEN OTHERS THEN
      RAISE WARNING 'Failed to create usage_tracking for user %: %', NEW.id, SQLERRM;
  END;

  -- Always return NEW to not block the auth process
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
