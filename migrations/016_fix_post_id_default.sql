-- Migration: Fix post_id and collab_id default values
-- Date: 2026-01-08
-- This adds UUID generation defaults to primary keys

BEGIN;

-- Enable uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Fix post_note.post_id default (UUID)
DO $$ 
BEGIN
    -- Check if post_id has a default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'post_note' 
        AND column_name = 'post_id'
        AND column_default IS NOT NULL
    ) THEN
        -- Set default to generate UUID
        ALTER TABLE public.post_note 
        ALTER COLUMN post_id SET DEFAULT uuid_generate_v4();
    END IF;
END $$;

-- Fix collab_creation.collab_id default (UUID)
DO $$ 
BEGIN
    -- Check if collab_id has a default
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_id'
        AND column_default IS NOT NULL
    ) THEN
        -- Set default to generate UUID
        ALTER TABLE public.collab_creation 
        ALTER COLUMN collab_id SET DEFAULT uuid_generate_v4();
    END IF;
END $$;

COMMIT;

-- Verification query:
-- SELECT 
--   table_name, 
--   column_name, 
--   column_default 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('post_note', 'collab_creation')
-- AND column_name IN ('post_id', 'collab_id');
