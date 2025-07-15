
-- Add missing deactivation columns to isp_companies table
ALTER TABLE isp_companies 
ADD COLUMN IF NOT EXISTS deactivation_reason TEXT,
ADD COLUMN IF NOT EXISTS deactivated_at TIMESTAMP WITH TIME ZONE;

-- Update the deactivation_reason column to allow null values and add a default
ALTER TABLE isp_companies 
ALTER COLUMN deactivation_reason SET DEFAULT NULL;

-- Add an index for better performance on deactivated companies
CREATE INDEX IF NOT EXISTS idx_isp_companies_deactivated 
ON isp_companies (is_active, deactivated_at) 
WHERE is_active = false;
