-- Fix message_id NOT NULL constraint issue
-- Date: 2026-01-08
-- This adds proper auto-generation of message_id

BEGIN;

-- Check current message_id column type and add default
DO $$
BEGIN
    -- If message_id is integer, add sequence
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'message_id' 
        AND data_type = 'integer'
    ) THEN
        CREATE SEQUENCE IF NOT EXISTS messages_message_id_seq;
        ALTER TABLE public.messages ALTER COLUMN message_id SET DEFAULT nextval('messages_message_id_seq');
        ALTER SEQUENCE messages_message_id_seq OWNED BY public.messages.message_id;
        PERFORM setval('messages_message_id_seq', COALESCE((SELECT MAX(message_id) FROM public.messages), 0) + 1);
        RAISE NOTICE 'Added sequence for integer message_id';
    
    -- If message_id is UUID, add UUID generation
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'message_id' 
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE public.messages ALTER COLUMN message_id SET DEFAULT gen_random_uuid();
        RAISE NOTICE 'Added UUID generation for message_id';
    
    -- If message_id is bigint, add sequence
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' 
        AND column_name = 'message_id' 
        AND data_type = 'bigint'
    ) THEN
        CREATE SEQUENCE IF NOT EXISTS messages_message_id_seq;
        ALTER TABLE public.messages ALTER COLUMN message_id SET DEFAULT nextval('messages_message_id_seq');
        ALTER SEQUENCE messages_message_id_seq OWNED BY public.messages.message_id;
        PERFORM setval('messages_message_id_seq', COALESCE((SELECT MAX(message_id) FROM public.messages), 0) + 1);
        RAISE NOTICE 'Added sequence for bigint message_id';
    
    ELSE
        RAISE NOTICE 'message_id column type not recognized or already has default';
    END IF;
END $$;

COMMIT;