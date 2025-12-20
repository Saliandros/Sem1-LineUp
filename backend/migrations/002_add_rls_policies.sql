-- Migration: Add Row Level Security Policies
-- Date: 2025-12-20
-- This enables RLS and creates policies for all tables

BEGIN;

-- ============================================
-- CLEAN UP: Drop all existing policies first
-- ============================================

DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname 
              FROM pg_policies 
              WHERE schemaname = 'public') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- DISABLE RLS ON ALL TABLES (to reset)
-- ============================================

ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.threads DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.thread_participants DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_note DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.collab_creation DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.genres DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tags_post_join DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.genre_collab_join DISABLE ROW LEVEL SECURITY;

-- ============================================
-- RE-ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_note ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collab_creation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags_post_join ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genre_collab_join ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================

-- Everyone can view all profiles (public profiles)
CREATE POLICY "Anyone can view profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- ============================================
-- THREADS POLICIES
-- ============================================

-- Users can view threads they participate in
CREATE POLICY "Users can view their threads"
ON public.threads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.thread_participants
    WHERE thread_participants.thread_id = threads.thread_id
    AND thread_participants.user_id = auth.uid()
  )
);

-- Users can create threads
CREATE POLICY "Users can create threads"
ON public.threads
FOR INSERT
WITH CHECK (auth.uid() = created_by_user_id);

-- Users can update threads they created
CREATE POLICY "Users can update own threads"
ON public.threads
FOR UPDATE
USING (auth.uid() = created_by_user_id)
WITH CHECK (auth.uid() = created_by_user_id);

-- Users can delete threads they created
CREATE POLICY "Users can delete own threads"
ON public.threads
FOR DELETE
USING (auth.uid() = created_by_user_id);

-- ============================================
-- THREAD_PARTICIPANTS POLICIES
-- ============================================

-- Users can view participants of threads they're in
CREATE POLICY "Users can view thread participants"
ON public.thread_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.thread_participants AS tp
    WHERE tp.thread_id = thread_participants.thread_id
    AND tp.user_id = auth.uid()
  )
);

-- Thread creators can add participants
CREATE POLICY "Thread creators can add participants"
ON public.thread_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.threads
    WHERE threads.thread_id = thread_participants.thread_id
    AND threads.created_by_user_id = auth.uid()
  )
);

-- Users can remove themselves from threads
CREATE POLICY "Users can leave threads"
ON public.thread_participants
FOR DELETE
USING (user_id = auth.uid());

-- ============================================
-- MESSAGES POLICIES
-- ============================================

-- Users can view messages in threads they participate in
CREATE POLICY "Users can view messages in their threads"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.thread_participants
    WHERE thread_participants.thread_id = messages.thread_id
    AND thread_participants.user_id = auth.uid()
  )
);

-- Users can send messages to threads they're in
CREATE POLICY "Users can send messages to their threads"
ON public.messages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.thread_participants
    WHERE thread_participants.thread_id = messages.thread_id
    AND thread_participants.user_id = auth.uid()
  )
);

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
ON public.messages
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POST_NOTE POLICIES
-- ============================================

-- Everyone can view all posts
CREATE POLICY "Anyone can view posts"
ON public.post_note
FOR SELECT
USING (true);

-- Users can create their own posts
CREATE POLICY "Users can create own posts"
ON public.post_note
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
ON public.post_note
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
ON public.post_note
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- COLLAB_CREATION POLICIES
-- ============================================

-- Everyone can view all collaborations
CREATE POLICY "Anyone can view collaborations"
ON public.collab_creation
FOR SELECT
USING (true);

-- Users can create their own collaborations
CREATE POLICY "Users can create own collaborations"
ON public.collab_creation
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own collaborations
CREATE POLICY "Users can update own collaborations"
ON public.collab_creation
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own collaborations
CREATE POLICY "Users can delete own collaborations"
ON public.collab_creation
FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- CONNECTIONS POLICIES
-- ============================================

-- Users can view connections they're part of
CREATE POLICY "Users can view their connections"
ON public.connections
FOR SELECT
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can create connections involving themselves
CREATE POLICY "Users can create connections"
ON public.connections
FOR INSERT
WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Users can delete connections they're part of
CREATE POLICY "Users can delete their connections"
ON public.connections
FOR DELETE
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- ============================================
-- TAGS AND GENRE TABLES (Public Read)
-- ============================================

-- Enable RLS
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags_post_join ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.genre_collab_join ENABLE ROW LEVEL SECURITY;

-- Everyone can view tags and genres
CREATE POLICY "Anyone can view tags"
ON public.tags
FOR SELECT
USING (true);

CREATE POLICY "Anyone can view genres"
ON public.genres
FOR SELECT
USING (true);

-- Users can manage their post tags
CREATE POLICY "Users can manage post tags"
ON public.tags_post_join
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.post_note
    WHERE post_note.post_id = tags_post_join.post_id
    AND post_note.user_id = auth.uid()
  )
);

-- Users can manage their collab genres
CREATE POLICY "Users can manage collab genres"
ON public.genre_collab_join
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.collab_creation
    WHERE collab_creation.collab_id = genre_collab_join.collab_id
    AND collab_creation.user_id = auth.uid()
  )
);

COMMIT;

-- ============================================
-- Verification queries (run manually after migration)
-- ============================================

-- Check that RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- List all policies:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
