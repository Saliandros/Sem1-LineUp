-- Enable realtime for chat functionality
-- Date: 2026-01-08
-- This enables realtime subscriptions for messages table

BEGIN;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Enable realtime for threads table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.threads;

-- Enable realtime for thread_participants table (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE public.thread_participants;

COMMIT;