
-- Add setup_fee column to service_packages table if it doesn't exist
ALTER TABLE service_packages 
ADD COLUMN IF NOT EXISTS setup_fee NUMERIC DEFAULT 2500;

-- Create mpesa_settings table for storing M-Pesa configuration
CREATE TABLE IF NOT EXISTS mpesa_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_company_id UUID NOT NULL,
  shortcode VARCHAR(20) NOT NULL,
  consumer_key TEXT,
  consumer_secret TEXT,
  passkey TEXT,
  callback_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create family_bank_settings table for storing Family Bank configuration
CREATE TABLE IF NOT EXISTS family_bank_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_company_id UUID NOT NULL,
  merchant_code VARCHAR(50) NOT NULL,
  paybill_number VARCHAR(20) NOT NULL,
  client_id TEXT,
  client_secret TEXT,
  token_url TEXT,
  stk_url TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for mpesa_settings
ALTER TABLE mpesa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their M-Pesa settings" 
  ON mpesa_settings 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for family_bank_settings
ALTER TABLE family_bank_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their Family Bank settings" 
  ON family_bank_settings 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Add payment_type column to installation_invoices to track payment method
ALTER TABLE installation_invoices 
ADD COLUMN IF NOT EXISTS payment_type VARCHAR(20);

-- Add manual_payment_details column for cash payments
ALTER TABLE installation_invoices 
ADD COLUMN IF NOT EXISTS manual_payment_details JSONB;

-- Update system_settings to include installation_fee
ALTER TABLE system_settings 
ADD COLUMN IF NOT EXISTS installation_fee NUMERIC DEFAULT 2500;
