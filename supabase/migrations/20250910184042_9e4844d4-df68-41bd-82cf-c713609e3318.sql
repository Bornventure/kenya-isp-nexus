-- Add secret fields to mikrotik_routers table for RADIUS authentication
ALTER TABLE public.mikrotik_routers 
ADD COLUMN IF NOT EXISTS radius_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS coa_secret VARCHAR(255);

-- Create an index for better performance on secret lookups
CREATE INDEX IF NOT EXISTS idx_mikrotik_routers_secrets ON public.mikrotik_routers(radius_secret, coa_secret);

-- Add groupname mapping to service_packages table
ALTER TABLE public.service_packages
ADD COLUMN IF NOT EXISTS groupname VARCHAR(50) DEFAULT 'bronze';