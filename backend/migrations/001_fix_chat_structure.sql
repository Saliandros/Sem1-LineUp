-- Migration: Fix chat structure (messages, threads, thread_participants)
-- Date: 2025-12-20
-- IMPORTANT: Run this in a transaction and backup your database first!

BEGIN;

-- ============================================
-- STEP 1: Fix messages table
-- ============================================

-- Add new columns if they don't exist
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS message_content text;

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone;

ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;

-- Migrate data from messages_content to message_content (if messages_content exists as wrong type)
-- Note: If messages_content was timestamp, data might be corrupted. Manual inspection needed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'messages' AND column_name = 'messages_content') THEN
    -- If you have data in messages_content that needs to be preserved, 
    -- you'll need to manually inspect and decide how to migrate it
    RAISE NOTICE 'Column messages_content exists - manual data migration may be needed';
  END IF;
END $$;

-- Change created_at from date to timestamp if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'messages' 
    AND column_name = 'created_at' 
    AND data_type = 'date'
  ) THEN
    ALTER TABLE public.messages 
    ALTER COLUMN created_at TYPE timestamp without time zone 
    USING created_at::timestamp without time zone;
  END IF;
END $$;

-- Update foreign key to cascade on delete
ALTER TABLE public.messages 
DROP CONSTRAINT IF EXISTS messages_thread_id_fkey;

ALTER TABLE public.messages 
ADD CONSTRAINT messages_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES public.threads(thread_id) ON DELETE CASCADE;

-- ============================================
-- STEP 2: Fix threads table
-- ============================================

-- Add new columns
ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS thread_name text;

ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS thread_type character varying(20) DEFAULT 'direct';

ALTER TABLE public.threads 
ADD COLUMN IF NOT EXISTS updated_at timestamp without time zone;

-- Rename user_id to created_by_user_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'threads' AND column_name = 'user_id') THEN
    
    -- Drop old foreign key
    ALTER TABLE public.threads DROP CONSTRAINT IF EXISTS threads_user_id_fkey;
    
    -- Rename column
    ALTER TABLE public.threads RENAME COLUMN user_id TO created_by_user_id;
    
    -- Add new foreign key
    ALTER TABLE public.threads 
    ADD CONSTRAINT threads_created_by_user_id_fkey 
    FOREIGN KEY (created_by_user_id) REFERENCES public.profiles(id);
  END IF;
END $$;

-- Remove group_id column if it exists (assuming it's not used)
ALTER TABLE public.threads 
DROP COLUMN IF EXISTS group_id;

-- Add default to created_at if not already there
ALTER TABLE public.threads 
ALTER COLUMN created_at SET DEFAULT now();

-- ============================================
-- STEP 3: Fix thread_participants table
-- ============================================

-- Change role from uuid to varchar
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'thread_participants' 
    AND column_name = 'role' 
    AND data_type = 'uuid'
  ) THEN
    -- Drop the column and recreate it (data will be lost, but uuid doesn't make sense for role)
    ALTER TABLE public.thread_participants DROP COLUMN role;
    ALTER TABLE public.thread_participants 
    ADD COLUMN role character varying(20) DEFAULT 'member';
  END IF;
END $$;

-- Add last_read_at column
ALTER TABLE public.thread_participants 
ADD COLUMN IF NOT EXISTS last_read_at timestamp without time zone;

-- Add default to joined_at
ALTER TABLE public.thread_participants 
ALTER COLUMN joined_at SET DEFAULT now();

-- Update foreign key to cascade on delete
ALTER TABLE public.thread_participants 
DROP CONSTRAINT IF EXISTS thread_participants_thread_id_fkey;

ALTER TABLE public.thread_participants 
ADD CONSTRAINT thread_participants_thread_id_fkey 
FOREIGN KEY (thread_id) REFERENCES public.threads(thread_id) ON DELETE CASCADE;

-- ============================================
-- STEP 4: Migrate existing data to thread_participants
-- ============================================

-- For existing threads, create thread_participants entries if they don't exist
-- This ensures all existing one-to-one chats have proper participants

-- IMPORTANT: Adjust this based on your old threads structure
-- If you had user_id and user_id_1, this will migrate them
DO $$
DECLARE
  thread_record RECORD;
BEGIN
  -- Check if user_id_1 column still exists (old structure)
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'threads' AND column_name = 'user_id_1') THEN
    
    -- Migrate old structure to thread_participants
    FOR thread_record IN 
      SELECT thread_id, created_by_user_id, user_id_1 
      FROM public.threads 
      WHERE user_id_1 IS NOT NULL
    LOOP
      -- Add creator as participant
      INSERT INTO public.thread_participants (thread_id, user_id, role, joined_at)
      VALUES (thread_record.thread_id, thread_record.created_by_user_id, 'member', now())
      ON CONFLICT (thread_id, user_id) DO NOTHING;
      
      -- Add other user as participant
      INSERT INTO public.thread_participants (thread_id, user_id, role, joined_at)
      VALUES (thread_record.thread_id, thread_record.user_id_1, 'member', now())
      ON CONFLICT (thread_id, user_id) DO NOTHING;
    END LOOP;
    
    -- Now we can drop user_id_1
    ALTER TABLE public.threads DROP COLUMN user_id_1;
  END IF;
END $$;

-- ============================================
-- STEP 5: Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON public.messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_thread_participants_user_id ON public.thread_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_created_by ON public.threads(created_by_user_id);

COMMIT;

-- ============================================
-- Post-migration checks (run these manually)
-- ============================================

-- Check that all messages have content:
-- SELECT message_id, thread_id, message_content FROM messages WHERE message_content IS NULL LIMIT 10;

-- Check that all threads have participants:
-- SELECT t.thread_id, COUNT(tp.user_id) as participant_count 
-- FROM threads t 
-- LEFT JOIN thread_participants tp ON t.thread_id = tp.thread_id 
-- GROUP BY t.thread_id 
-- HAVING COUNT(tp.user_id) = 0;

-- Check thread_participants roles:
-- SELECT DISTINCT role FROM thread_participants;
