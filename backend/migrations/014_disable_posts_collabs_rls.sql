-- Migration: Temporarily disable RLS for posts and collaborations
-- Date: 2026-01-08
-- This disables RLS to allow backend service_role to create posts/collabs

BEGIN;

-- Disable RLS on post_note and collab_creation tables
-- This allows the backend service with service_role key to bypass RLS
ALTER TABLE IF EXISTS public.post_note DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collab_creation DISABLE ROW LEVEL SECURITY;

-- Note: Service role key should bypass RLS anyway, but this ensures it works
-- In production, you may want to keep RLS enabled and use proper JWT tokens

COMMIT;

-- Verification query:
-- SELECT tablename, rowsecurity 
-- FROM pg_tables 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('post_note', 'collab_creation');
