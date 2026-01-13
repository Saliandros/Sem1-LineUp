-- Quick fix script: Disable RLS on both tables for testing
-- Date: 2026-01-08
-- WARNING: This removes security! Only for testing chat functionality.

BEGIN;

-- Disable RLS on both problematic tables
ALTER TABLE public.thread_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;

-- Optional: Add simple policies for authenticated users
-- CREATE POLICY "Allow authenticated users" ON public.threads FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow authenticated users" ON public.thread_participants FOR ALL USING (auth.uid() IS NOT NULL);
-- CREATE POLICY "Allow authenticated users" ON public.messages FOR ALL USING (auth.uid() IS NOT NULL);

COMMIT;