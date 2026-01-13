-- Add group_name column to threads table for custom group chat names
-- Date: 2026-01-08

BEGIN;

-- Add group_name column to threads table
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Add group_image column to threads table for custom group avatars
ALTER TABLE public.threads ADD COLUMN IF NOT EXISTS group_image TEXT;

-- Add comment to explain the columns
COMMENT ON COLUMN public.threads.group_name IS 'Custom name for group chats. If NULL, name is generated from participant names.';
COMMENT ON COLUMN public.threads.group_image IS 'URL to group chat avatar image. If NULL, default group icon is shown.';

COMMIT;