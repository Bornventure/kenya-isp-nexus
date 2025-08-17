
-- Create workflow stages enum
CREATE TYPE workflow_stage AS ENUM (
  'pending_verification',
  'approved',
  'rejected',
  'equipment_assigned',
  'invoice_generated',
  'payment_pending',
  'service_active'
);

-- Create notification templates table
CREATE TABLE notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- 'sms', 'email', 'whatsapp'
  trigger_event VARCHAR(100) NOT NULL, -- 'account_creation', 'renewal_confirmation', etc.
  subject VARCHAR(255), -- for email templates
  message_template TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- available template variables
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notification logs table
CREATE TABLE notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  template_id UUID REFERENCES notification_templates(id),
  trigger_event VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'auto', 'manual', 'broadcast'
  channels TEXT[] DEFAULT ARRAY['sms'], -- ['sms', 'email', 'whatsapp']
  recipients TEXT[] NOT NULL,
  message_content TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create installation invoice tracking
ALTER TABLE installation_invoices 
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS distribution_method VARCHAR(50); -- 'email', 'whatsapp', 'manual'

-- Create auto notification settings
CREATE TABLE auto_notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 0,
  retry_attempts INTEGER DEFAULT 3,
  retry_delay_minutes INTEGER DEFAULT 5,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update clients table with workflow tracking
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS workflow_stage workflow_stage DEFAULT 'pending_verification',
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS equipment_assigned JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS installation_invoice_id UUID REFERENCES installation_invoices(id);

-- Enable RLS on new tables
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_templates
CREATE POLICY "Company users can manage their templates" ON notification_templates
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- RLS policies for notification_logs  
CREATE POLICY "Company users can view their notification logs" ON notification_logs
  FOR SELECT USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can insert notification logs" ON notification_logs
  FOR INSERT WITH CHECK (isp_company_id = get_current_user_company_id());

-- RLS policies for auto_notification_settings
CREATE POLICY "Company users can manage their auto notification settings" ON auto_notification_settings
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Function to generate tracking number
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  tracking_num TEXT;
  counter INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(tracking_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO counter
  FROM installation_invoices 
  WHERE tracking_number IS NOT NULL;
  
  tracking_num := 'TRK-' || LPAD(counter::TEXT, 8, '0');
  RETURN tracking_num;
END;
$$;

-- Function to update workflow stage
CREATE OR REPLACE FUNCTION update_client_workflow_status(
  p_client_id UUID,
  p_stage workflow_stage,
  p_stage_data JSONB DEFAULT '{}'::jsonb,
  p_assigned_to UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO client_workflow_status (
    client_id, current_stage, stage_data, assigned_to, notes, isp_company_id
  )
  SELECT 
    p_client_id, p_stage::VARCHAR, p_stage_data, p_assigned_to, p_notes, c.isp_company_id
  FROM clients c 
  WHERE c.id = p_client_id;
  
  -- Update the client workflow_stage
  UPDATE clients 
  SET workflow_stage = p_stage,
      updated_at = NOW()
  WHERE id = p_client_id;
END;
$$;

-- Insert default notification templates
INSERT INTO notification_templates (name, category, trigger_event, subject, message_template, variables, isp_company_id) 
SELECT 
  'Account Creation Invoice', 
  'sms', 
  'account_creation',
  NULL,
  'Hello {{client_name}}, welcome to {{company_name}}! Your installation invoice {{invoice_number}} for KES {{amount}} has been generated. Track: {{tracking_number}}. Pay via Paybill {{paybill_number}}, Account: {{client_phone}}.',
  '["client_name", "company_name", "invoice_number", "amount", "tracking_number", "paybill_number", "client_phone"]'::jsonb,
  ic.id
FROM isp_companies ic;

INSERT INTO notification_templates (name, category, trigger_event, subject, message_template, variables, isp_company_id)
SELECT
  'Service Renewal Confirmation',
  'sms', 
  'renewal_confirmation',
  NULL,
  'Hello {{client_name}}, your service has been renewed successfully! New expiry: {{expiry_date}}. Remaining wallet balance: KES {{wallet_balance}}. Thank you!',
  '["client_name", "expiry_date", "wallet_balance"]'::jsonb,
  ic.id
FROM isp_companies ic;

INSERT INTO notification_templates (name, category, trigger_event, subject, message_template, variables, isp_company_id)
SELECT
  'Payment Reminder - 3 Days',
  'sms',
  'payment_reminder_3_days', 
  NULL,
  'Hello {{client_name}}, your service expires in 3 days. Please top up KES {{amount}} to avoid disconnection. Paybill: {{paybill_number}}, Account: {{client_phone}}.',
  '["client_name", "amount", "paybill_number", "client_phone"]'::jsonb,
  ic.id
FROM isp_companies ic;

INSERT INTO notification_templates (name, category, trigger_event, subject, message_template, variables, isp_company_id)
SELECT
  'Disconnection Notice',
  'sms',
  'service_disconnection',
  NULL, 
  'Hello {{client_name}}, your service has been suspended due to insufficient funds. Please top up KES {{amount}} to restore service. Paybill: {{paybill_number}}, Account: {{client_phone}}.',
  '["client_name", "amount", "paybill_number", "client_phone"]'::jsonb,
  ic.id
FROM isp_companies ic;

-- Insert default auto notification settings
INSERT INTO auto_notification_settings (trigger_event, is_enabled, isp_company_id)
SELECT 'account_creation', true, ic.id FROM isp_companies ic;

INSERT INTO auto_notification_settings (trigger_event, is_enabled, isp_company_id) 
SELECT 'renewal_confirmation', true, ic.id FROM isp_companies ic;

INSERT INTO auto_notification_settings (trigger_event, is_enabled, delay_minutes, isp_company_id)
SELECT 'payment_reminder_3_days', true, 4320, ic.id FROM isp_companies ic; -- 3 days = 4320 minutes

INSERT INTO auto_notification_settings (trigger_event, is_enabled, isp_company_id)
SELECT 'service_disconnection', true, ic.id FROM isp_companies ic;
