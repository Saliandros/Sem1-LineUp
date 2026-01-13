-- Migration: Fix collab_creation column names to match backend expectations
-- Date: 2026-01-08
-- Ensures collab_creation table has correct column names with collab_ prefix

BEGIN;

-- Fix collab_creation table columns
DO $$ 
BEGIN
    -- Fix title column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_title'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'title'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN title TO collab_title;
            RAISE NOTICE 'Renamed title to collab_title';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_title TEXT;
            RAISE NOTICE 'Created collab_title column';
        END IF;
    END IF;

    -- Fix description column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_description'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'description'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN description TO collab_description;
            RAISE NOTICE 'Renamed description to collab_description';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_description TEXT;
            RAISE NOTICE 'Created collab_description column';
        END IF;
    END IF;

    -- Fix image column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_image'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'image'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN image TO collab_image;
            RAISE NOTICE 'Renamed image to collab_image';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_image TEXT;
            RAISE NOTICE 'Created collab_image column';
        END IF;
    END IF;

    -- Fix location column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_location'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'location'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN location TO collab_location;
            RAISE NOTICE 'Renamed location to collab_location';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_location TEXT;
            RAISE NOTICE 'Created collab_location column';
        END IF;
    END IF;

    -- Fix genres column (jsonb array)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_genres'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'genres'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN genres TO collab_genres;
            RAISE NOTICE 'Renamed genres to collab_genres';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_genres JSONB DEFAULT '[]'::jsonb;
            RAISE NOTICE 'Created collab_genres column';
        END IF;
    END IF;

    -- Fix paid column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'collab_creation' 
        AND column_name = 'collab_paid'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'collab_creation' 
            AND column_name = 'paid'
        ) THEN
            ALTER TABLE public.collab_creation RENAME COLUMN paid TO collab_paid;
            RAISE NOTICE 'Renamed paid to collab_paid';
        ELSE
            ALTER TABLE public.collab_creation ADD COLUMN collab_paid BOOLEAN DEFAULT false;
            RAISE NOTICE 'Created collab_paid column';
        END IF;
    END IF;

END $$;

COMMIT;

-- Verification query - shows all columns in collab_creation table:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
-- AND table_name = 'collab_creation'
-- ORDER BY ordinal_position;
