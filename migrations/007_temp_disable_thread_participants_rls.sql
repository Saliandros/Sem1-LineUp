-- Quick fix: Temporarily disable RLS for thread_participants to test chat
-- Date: 2026-01-08
-- WARNING: This removes security! Only for testing purposes.

BEGIN;

-- Disable RLS on thread_participants table
ALTER TABLE public.thread_participants DISABLE ROW LEVEL SECURITY;

-- Optional: Re-create a simple policy later
-- CREATE POLICY "Allow authenticated users" ON public.thread_participants FOR ALL USING (auth.uid() IS NOT NULL);

COMMIT;