-- Add status column to connections table for friend request system
-- Status: 'pending' (default), 'accepted', 'rejected'

-- Add status column
ALTER TABLE public.connections 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add constraint to ensure valid status values
ALTER TABLE public.connections 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add requester column to track who initiated the connection
-- This helps determine who needs to accept/reject
ALTER TABLE public.connections
ADD COLUMN IF NOT EXISTS requester_id UUID REFERENCES auth.users(id);

-- Update existing connections to be 'accepted' (backward compatibility)
UPDATE public.connections 
SET status = 'accepted'
WHERE status IS NULL;

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_connections_status ON public.connections(status);
CREATE INDEX IF NOT EXISTS idx_connections_requester ON public.connections(requester_id);

-- Update RLS policy to allow users to update connection status
-- Only user_id_2 (the recipient) can accept/reject a pending request
DROP POLICY IF EXISTS "Users can update connection status" ON public.connections;
CREATE POLICY "Users can update connection status"
ON public.connections
FOR UPDATE
USING (auth.uid() = user_id_2 AND status = 'pending')
WITH CHECK (auth.uid() = user_id_2);

-- Comments for documentation
COMMENT ON COLUMN public.connections.status IS 'Connection status: pending (awaiting acceptance), accepted (active connection), rejected (declined)';
COMMENT ON COLUMN public.connections.requester_id IS 'User ID of the person who initiated the connection request';
