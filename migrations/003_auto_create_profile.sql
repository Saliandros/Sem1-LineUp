-- Migration: Auto-create profile when user signs up
-- Date: 2025-12-20
-- This creates a trigger to automatically create a profile entry when a new user signs up

BEGIN;

-- ============================================
-- CREATE TRIGGER FUNCTION
-- ============================================

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    displayname,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'displayname', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- CREATE TRIGGER
-- ============================================

-- Trigger to call function when new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- BACKFILL EXISTING USERS
-- ============================================

-- Create profiles for any existing users that don't have one
INSERT INTO public.profiles (
  id,
  email,
  displayname,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'displayname', split_part(u.email, '@', 1)),
  NOW(),
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
)
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- ============================================
-- Verification queries (run manually after migration)
-- ============================================

-- Check that trigger exists:
-- SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check that function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'handle_new_user';

-- Check that all users have profiles:
-- SELECT 
--   (SELECT COUNT(*) FROM auth.users) as user_count,
--   (SELECT COUNT(*) FROM public.profiles) as profile_count;
