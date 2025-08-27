
-- Add missing columns to service_packages table
ALTER TABLE public.service_packages 
ADD COLUMN IF NOT EXISTS setup_fee numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS data_limit integer;

-- Add comment for clarity
COMMENT ON COLUMN public.service_packages.setup_fee IS 'One-time setup fee for the service package';
COMMENT ON COLUMN public.service_packages.data_limit IS 'Data limit in MB for the service package (null means unlimited)';
