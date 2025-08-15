
-- Phase 1: Enhanced Approval Workflow System
-- Add rejection tracking to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rejected_by UUID REFERENCES auth.users(id);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

-- Phase 2: Equipment Assignment Integration
-- Create equipment assignments table if not exists (enhanced)
CREATE TABLE IF NOT EXISTS client_equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  installation_notes TEXT,
  status VARCHAR(50) DEFAULT 'assigned',
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 4: SMS Templates System
-- Create comprehensive SMS templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) NOT NULL,
  template_name VARCHAR(255) NOT NULL,
  template_content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_key, isp_company_id)
);

-- Insert default SMS templates
INSERT INTO sms_templates (template_key, template_name, template_content, variables, isp_company_id)
SELECT 
  template_key,
  template_name,
  template_content,
  variables::jsonb,
  ic.id
FROM (VALUES
  ('account_created', 'Account Creation Notice', 'Dear {{client_name}}, your internet account has been created. Installation invoice: {{invoice_number}}. Amount: KES {{amount}}. Pay via Paybill {{paybill}} Account: {{phone}}. Installation will be scheduled after payment.', '["client_name", "invoice_number", "amount", "paybill", "phone"]'),
  ('service_renewed', 'Service Renewal Success', 'Dear {{client_name}}, your internet service has been renewed successfully. Valid until {{expiry_date}}. New balance: KES {{balance}}. Thank you!', '["client_name", "expiry_date", "balance"]'),
  ('balance_warning_3days', '3-Day Balance Warning', 'Dear {{client_name}}, your service expires in 3 days. Current balance: KES {{balance}}. Top up KES {{required_amount}} to avoid disconnection. Paybill: {{paybill}}, Account: {{phone}}.', '["client_name", "balance", "required_amount", "paybill", "phone"]'),
  ('balance_warning_2days', '2-Day Balance Warning', 'Dear {{client_name}}, URGENT: Your service expires in 2 days. Current balance: KES {{balance}}. Pay KES {{required_amount}} now to avoid disconnection. Paybill: {{paybill}}, Account: {{phone}}.', '["client_name", "balance", "required_amount", "paybill", "phone"]'),
  ('balance_warning_1day', '1-Day Final Warning', 'Dear {{client_name}}, FINAL WARNING: Your service expires tomorrow. Balance: KES {{balance}}. Pay KES {{required_amount}} urgently. Paybill: {{paybill}}, Account: {{phone}}.', '["client_name", "balance", "required_amount", "paybill", "phone"]'),
  ('service_disconnected', 'Service Disconnection Notice', 'Dear {{client_name}}, your internet service has been suspended due to insufficient balance. Pay KES {{required_amount}} for immediate reactivation. Paybill: {{paybill}}, Account: {{phone}}.', '["client_name", "required_amount", "paybill", "phone"]'),
  ('post_disconnect_reminder', '3-Day Post-Disconnection Reminder', 'Dear {{client_name}}, your internet service was suspended 3 days ago. Reactivate now by paying KES {{required_amount}}. Paybill: {{paybill}}, Account: {{phone}}. We miss you!', '["client_name", "required_amount", "paybill", "phone"]'),
  ('network_issue', 'Network Issue Notification', 'Dear {{client_name}}, we are experiencing network issues in your area. Our technical team is working to resolve this. Expected resolution: {{eta}}. We apologize for the inconvenience.', '["client_name", "eta"]'),
  ('general_broadcast', 'General Announcement', '{{message}}', '["message"]')
) AS t(template_key, template_name, template_content, variables)
CROSS JOIN isp_companies ic
WHERE NOT EXISTS (
  SELECT 1 FROM sms_templates st 
  WHERE st.template_key = t.template_key AND st.isp_company_id = ic.id
);

-- Phase 5: Automated Wallet Monitoring
-- Create wallet monitoring rules table
CREATE TABLE IF NOT EXISTS wallet_monitoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL, -- 'low_balance', 'auto_renewal', 'disconnection'
  threshold_amount DECIMAL(12,2),
  threshold_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP WITH TIME ZONE,
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phase 6: Enhanced Installation Invoice System
-- Add tracking fields to installation_invoices
ALTER TABLE installation_invoices ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100) UNIQUE;
ALTER TABLE installation_invoices ADD COLUMN IF NOT EXISTS distribution_method VARCHAR(50); -- 'email', 'whatsapp', 'sms'
ALTER TABLE installation_invoices ADD COLUMN IF NOT EXISTS distributed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE installation_invoices ADD COLUMN IF NOT EXISTS distributed_by UUID REFERENCES auth.users(id);

-- Create workflow status tracking table
CREATE TABLE IF NOT EXISTS client_workflow_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  current_stage VARCHAR(100) NOT NULL, -- 'pending_approval', 'approved', 'rejected', 'equipment_assigned', 'invoice_generated', 'payment_pending', 'service_active'
  stage_data JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for new tables
ALTER TABLE client_equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_monitoring_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_workflow_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Company users can manage client equipment assignments" ON client_equipment_assignments
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage SMS templates" ON sms_templates
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage wallet monitoring rules" ON wallet_monitoring_rules
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage workflow status" ON client_workflow_status
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create function to generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

-- Create function to update client workflow status
CREATE OR REPLACE FUNCTION update_client_workflow_status(
  p_client_id UUID,
  p_stage VARCHAR(100),
  p_stage_data JSONB DEFAULT '{}',
  p_assigned_to UUID DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO client_workflow_status (
    client_id, current_stage, stage_data, assigned_to, notes, isp_company_id
  )
  SELECT 
    p_client_id, p_stage, p_stage_data, p_assigned_to, p_notes, c.isp_company_id
  FROM clients c 
  WHERE c.id = p_client_id;
  
  -- Update the client status to match workflow stage
  UPDATE clients 
  SET status = CASE 
    WHEN p_stage = 'approved' THEN 'approved'::client_status
    WHEN p_stage = 'rejected' THEN 'pending'::client_status
    WHEN p_stage = 'service_active' THEN 'active'::client_status
    ELSE status
  END,
  updated_at = NOW()
  WHERE id = p_client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
