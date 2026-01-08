-- Migration: Add spotify_url to profiles table
-- Date: 2026-01-08
-- Adds spotify_url column to store Spotify artist/playlist URLs

BEGIN;

-- Add spotify_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'spotify_url'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN spotify_url TEXT;
        
        COMMENT ON COLUMN public.profiles.spotify_url IS 'Spotify artist or playlist URL';
    END IF;
END $$;

COMMIT;

-- Verification query:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'profiles'
-- AND column_name = 'spotify_url';
