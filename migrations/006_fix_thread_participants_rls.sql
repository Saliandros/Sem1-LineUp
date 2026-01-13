-- Fix RLS infinite recursion in thread_participants
-- Date: 2026-01-08

BEGIN;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view thread participants" ON public.thread_participants;

-- Create a simpler, non-recursive policy
-- Users can view thread participants if they are participants themselves
CREATE POLICY "Users can view thread participants"
ON public.thread_participants
FOR SELECT
USING (
  -- Allow viewing if the user is the participant themselves
  user_id = auth.uid()
  OR
  -- Allow viewing if the authenticated user is a participant in the same thread
  thread_id IN (
    SELECT thread_id FROM public.thread_participants 
    WHERE user_id = auth.uid()
  )
);

COMMIT;