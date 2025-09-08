-- Add disconnection_scheduled_at column to clients table for network management
ALTER TABLE public.clients 
ADD COLUMN disconnection_scheduled_at timestamp with time zone;

-- Add helpful columns for network automation
ALTER TABLE public.clients 
ADD COLUMN last_radius_sync_at timestamp with time zone,
ADD COLUMN radius_sync_status character varying DEFAULT 'pending';