
-- Add 'rejected' to the client_status enum
ALTER TYPE client_status ADD VALUE 'rejected';

-- Add missing rejection-related fields to the clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS rejected_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejected_at timestamp with time zone;

-- Update the notes column if it doesn't exist (it should already exist based on the schema)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS notes text;

-- Add index for better query performance on rejection fields
CREATE INDEX IF NOT EXISTS idx_clients_rejected_by ON public.clients(rejected_by);
CREATE INDEX IF NOT EXISTS idx_clients_rejected_at ON public.clients(rejected_at);
