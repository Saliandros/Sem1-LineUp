-- Migration: Fix post_note and collab_creation column names
-- Date: 2026-01-08
-- This ensures column names match what the backend expects

BEGIN;

-- Fix post_note table columns if they don't exist
-- Add post_description if it doesn't exist (might be called 'description')
DO $$ 
BEGIN
    -- Check if post_description exists, if not, rename description to post_description
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'post_note' 
        AND column_name = 'post_description'
    ) THEN
        -- Check if there's a 'description' column we can rename
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'post_note' 
            AND column_name = 'description'
        ) THEN
            ALTER TABLE public.post_note RENAME COLUMN description TO post_description;
        ELSE
            -- Create the column if neither exists
            ALTER TABLE public.post_note ADD COLUMN post_description TEXT;
        END IF;
    END IF;

    -- Ensure other expected columns exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'post_note' 
        AND column_name = 'post_title'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'post_note' 
            AND column_name = 'title'
        ) THEN
            ALTER TABLE public.post_note RENAME COLUMN title TO post_title;
        END IF;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'post_note' 
        AND column_name = 'post_image'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'post_note' 
            AND column_name = 'image'
        ) THEN
            ALTER TABLE public.post_note RENAME COLUMN image TO post_image;
        END IF;
    END IF;
END $$;

COMMIT;

-- Verification query - shows all columns in post_note table:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'post_note'
-- ORDER BY ordinal_position;
