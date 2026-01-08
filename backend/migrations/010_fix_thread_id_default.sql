-- Fix thread_id NOT NULL constraint issue
-- Date: 2026-01-08
-- This adds proper auto-generation of thread_id

BEGIN;

-- Check current thread_id column type
DO $$
BEGIN
    -- Check if thread_id is integer (needs sequence)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'threads' 
        AND column_name = 'thread_id' 
        AND data_type = 'integer'
    ) THEN
        -- Create sequence for thread_id if it doesn't exist
        CREATE SEQUENCE IF NOT EXISTS threads_thread_id_seq;
        
        -- Set the sequence as default for thread_id
        ALTER TABLE public.threads 
        ALTER COLUMN thread_id SET DEFAULT nextval('threads_thread_id_seq');
        
        -- Set sequence ownership
        ALTER SEQUENCE threads_thread_id_seq OWNED BY public.threads.thread_id;
        
        -- Set current sequence value to max existing thread_id + 1
        PERFORM setval('threads_thread_id_seq', COALESCE((SELECT MAX(thread_id) FROM public.threads), 0) + 1);
        
        RAISE NOTICE 'Added sequence for integer thread_id';
    
    -- Check if thread_id is UUID (needs uuid generation)
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'threads' 
        AND column_name = 'thread_id' 
        AND data_type = 'uuid'
    ) THEN
        -- Set UUID generation as default
        ALTER TABLE public.threads 
        ALTER COLUMN thread_id SET DEFAULT gen_random_uuid();
        
        RAISE NOTICE 'Added UUID generation for thread_id';
    
    ELSE
        RAISE NOTICE 'thread_id column type not recognized or already has default';
    END IF;
END $$;

COMMIT;