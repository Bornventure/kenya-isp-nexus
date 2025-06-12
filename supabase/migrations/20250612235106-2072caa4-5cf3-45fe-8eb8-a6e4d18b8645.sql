
-- Add is_active column to clients table
ALTER TABLE public.clients 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

-- Update the column comment for clarity
COMMENT ON COLUMN public.clients.is_active IS 'Determines if the client account is active and can authenticate';
