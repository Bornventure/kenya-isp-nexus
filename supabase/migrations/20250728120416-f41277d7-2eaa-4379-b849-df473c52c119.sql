
-- Create notification templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  trigger_event VARCHAR(100) NOT NULL,
  subject VARCHAR(255),
  email_template TEXT,
  sms_template TEXT,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  channels TEXT[] DEFAULT '{"email","sms"}',
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(isp_company_id, trigger_event)
);

-- Create notification logs table
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.notification_templates(id) ON DELETE SET NULL,
  trigger_event VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  channels TEXT[] NOT NULL,
  recipients TEXT[] NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE
);

-- Create auto notification settings table
CREATE TABLE IF NOT EXISTS public.auto_notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_event VARCHAR(100) NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  delay_minutes INTEGER DEFAULT 0,
  retry_attempts INTEGER DEFAULT 3,
  retry_delay_minutes INTEGER DEFAULT 5,
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(isp_company_id, trigger_event)
);

-- Add RLS policies for notification templates
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their notification templates"
  ON public.notification_templates
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for notification logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can view their notification logs"
  ON public.notification_logs
  FOR SELECT
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Service role can manage notification logs"
  ON public.notification_logs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Add RLS policies for auto notification settings
ALTER TABLE public.auto_notification_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their auto notification settings"
  ON public.auto_notification_settings
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Insert default notification templates
INSERT INTO public.notification_templates (name, category, trigger_event, subject, email_template, sms_template, variables, channels, isp_company_id) 
SELECT 
  'Payment Confirmation',
  'billing',
  'payment_received',
  'Payment Confirmation - {{client_name}}',
  'Dear {{client_name}},

Thank you for your payment of {{amount}} received on {{payment_date}}. Your service has been renewed and will expire on {{expiry_date}}.

Receipt Number: {{receipt_number}}
Payment Method: {{payment_method}}

Thank you for choosing our services.

Best regards,
{{company_name}}',
  'Dear {{client_name}}, your payment of {{amount}} has been received. Service renewed until {{expiry_date}}. Receipt: {{receipt_number}}. Thank you!',
  '["client_name", "amount", "payment_date", "expiry_date", "receipt_number", "payment_method", "company_name"]'::jsonb,
  '{"email", "sms"}',
  ic.id
FROM isp_companies ic
WHERE NOT EXISTS (
  SELECT 1 FROM notification_templates nt 
  WHERE nt.isp_company_id = ic.id AND nt.trigger_event = 'payment_received'
);

-- Insert default auto notification settings
INSERT INTO public.auto_notification_settings (trigger_event, is_enabled, delay_minutes, isp_company_id)
SELECT 
  'payment_received',
  true,
  0,
  ic.id
FROM isp_companies ic
WHERE NOT EXISTS (
  SELECT 1 FROM auto_notification_settings ans 
  WHERE ans.isp_company_id = ic.id AND ans.trigger_event = 'payment_received'
);

-- Create function to trigger auto notifications
CREATE OR REPLACE FUNCTION public.trigger_auto_notification(
  p_client_id UUID,
  p_trigger_event VARCHAR(100),
  p_data JSONB DEFAULT '{}'::jsonb
) RETURNS VOID AS $$
DECLARE
  client_record RECORD;
  template_record RECORD;
  setting_record RECORD;
BEGIN
  -- Get client details
  SELECT c.*, ic.name as company_name
  INTO client_record
  FROM clients c
  JOIN isp_companies ic ON c.isp_company_id = ic.id
  WHERE c.id = p_client_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get notification setting
  SELECT * INTO setting_record
  FROM auto_notification_settings
  WHERE isp_company_id = client_record.isp_company_id
  AND trigger_event = p_trigger_event
  AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get template
  SELECT * INTO template_record
  FROM notification_templates
  WHERE isp_company_id = client_record.isp_company_id
  AND trigger_event = p_trigger_event
  AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Log the notification request
  INSERT INTO notification_logs (
    client_id,
    template_id,
    trigger_event,
    type,
    channels,
    recipients,
    status,
    isp_company_id
  ) VALUES (
    p_client_id,
    template_record.id,
    p_trigger_event,
    'auto',
    template_record.channels,
    ARRAY[client_record.email, client_record.phone],
    'pending',
    client_record.isp_company_id
  );
  
  -- Call the notification function asynchronously
  PERFORM net.http_post(
    url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-auto-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
    body := jsonb_build_object(
      'client_id', p_client_id,
      'trigger_event', p_trigger_event,
      'data', p_data
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for payment notifications
CREATE OR REPLACE FUNCTION public.handle_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Trigger payment confirmation notification
  IF TG_OP = 'INSERT' AND NEW.status = 'completed' THEN
    PERFORM trigger_auto_notification(
      NEW.client_id,
      'payment_received',
      jsonb_build_object(
        'amount', NEW.amount,
        'payment_method', NEW.payment_method,
        'receipt_number', NEW.reference_number,
        'payment_date', NEW.payment_date
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on payments table
DROP TRIGGER IF EXISTS payment_notification_trigger ON payments;
CREATE TRIGGER payment_notification_trigger
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_notification();
