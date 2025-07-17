
-- Create payment method settings table
CREATE TABLE IF NOT EXISTS payment_method_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_company_id UUID NOT NULL REFERENCES isp_companies(id) ON DELETE CASCADE,
  payment_method VARCHAR(50) NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  disabled_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(isp_company_id, payment_method)
);

-- Enable RLS
ALTER TABLE payment_method_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their payment method settings"
ON payment_method_settings
FOR ALL
TO authenticated
USING (isp_company_id = get_current_user_company_id())
WITH CHECK (isp_company_id = get_current_user_company_id());

-- Insert default settings for existing companies
INSERT INTO payment_method_settings (isp_company_id, payment_method, is_enabled)
SELECT id, 'mpesa', true FROM isp_companies
ON CONFLICT (isp_company_id, payment_method) DO NOTHING;

INSERT INTO payment_method_settings (isp_company_id, payment_method, is_enabled)
SELECT id, 'family_bank', true FROM isp_companies
ON CONFLICT (isp_company_id, payment_method) DO NOTHING;

-- Create function to automatically add default payment method settings for new companies
CREATE OR REPLACE FUNCTION create_default_payment_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_method_settings (isp_company_id, payment_method, is_enabled)
  VALUES 
    (NEW.id, 'mpesa', true),
    (NEW.id, 'family_bank', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new companies
CREATE TRIGGER create_payment_settings_on_company_insert
  AFTER INSERT ON isp_companies
  FOR EACH ROW
  EXECUTE FUNCTION create_default_payment_settings();
