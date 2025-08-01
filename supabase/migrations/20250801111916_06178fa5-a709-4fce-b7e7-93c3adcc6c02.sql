
-- Fix the notification_logs table by adding the missing client_id column
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id);

-- Update the trigger_auto_notification function to handle the missing client_id gracefully
CREATE OR REPLACE FUNCTION public.trigger_auto_notification(p_client_id uuid, p_trigger_event character varying, p_data jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
  
  -- Log the notification request with client_id
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
EXCEPTION
  WHEN OTHERS THEN
    -- Silently ignore notification errors to prevent payment processing failures
    NULL;
END;
$function$
