
-- Create radius_users table for client credentials
CREATE TABLE public.radius_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  bandwidth_profile VARCHAR(100),
  last_synced_to_radius TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID NOT NULL REFERENCES public.isp_companies(id),
  UNIQUE(client_id, isp_company_id)
);

-- Add RLS for radius_users
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their radius users" 
  ON public.radius_users 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Add status tracking fields to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS radius_sync_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS last_radius_sync_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS disconnection_scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS radius_username VARCHAR(255),
ADD COLUMN IF NOT EXISTS radius_password VARCHAR(255);

-- Create notification_logs table for tracking automated notifications
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  template_id UUID,
  trigger_event VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'auto',
  channels TEXT[] NOT NULL DEFAULT ARRAY['email', 'sms'],
  recipients TEXT[] NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their notification logs" 
  ON public.notification_logs 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Create function to generate RADIUS credentials
CREATE OR REPLACE FUNCTION public.generate_radius_credentials(p_client_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  client_record RECORD;
  username TEXT;
  password TEXT;
  result JSONB;
BEGIN
  -- Get client details
  SELECT c.*, sp.name as package_name, sp.download_speed, sp.upload_speed
  INTO client_record
  FROM clients c
  LEFT JOIN service_packages sp ON c.service_package_id = sp.id
  WHERE c.id = p_client_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Client not found');
  END IF;
  
  -- Generate username from client phone and first 8 chars of ID
  username := SUBSTRING(client_record.id::TEXT, 1, 8) || '@' || client_record.phone;
  
  -- Generate secure password
  password := SUBSTRING(md5(random()::text || client_record.id::text || now()::text), 1, 16);
  
  -- Insert or update radius_users
  INSERT INTO radius_users (
    username, password, client_id, bandwidth_profile, isp_company_id
  ) VALUES (
    username, password, p_client_id, 
    COALESCE(client_record.package_name, 'default'), 
    client_record.isp_company_id
  )
  ON CONFLICT (client_id, isp_company_id) 
  DO UPDATE SET 
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    bandwidth_profile = EXCLUDED.bandwidth_profile,
    updated_at = now();
  
  -- Update client with radius credentials
  UPDATE clients 
  SET 
    radius_username = username,
    radius_password = password,
    radius_sync_status = 'pending'
  WHERE id = p_client_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'username', username,
    'password', password,
    'bandwidth_profile', COALESCE(client_record.package_name, 'default')
  );
END;
$$;

-- Create function for precise billing automation
CREATE OR REPLACE FUNCTION public.process_billing_automation()
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
  client_record RECORD;
  minutes_until_expiry INTEGER;
  notification_type TEXT;
  renewal_result JSONB;
BEGIN
  -- Process clients with upcoming expiry (within next 4320 minutes = 3 days)
  FOR client_record IN
    SELECT c.*, sp.name as package_name, sp.monthly_rate
    FROM clients c
    LEFT JOIN service_packages sp ON c.service_package_id = sp.id
    WHERE c.status = 'active'
    AND c.subscription_end_date IS NOT NULL
    AND c.subscription_end_date > NOW()
    AND c.subscription_end_date <= NOW() + INTERVAL '3 days'
  LOOP
    -- Calculate minutes until expiry
    minutes_until_expiry := EXTRACT(EPOCH FROM (client_record.subscription_end_date - NOW())) / 60;
    
    -- Process based on time remaining
    IF minutes_until_expiry <= 2 THEN
      -- 2 minutes or less: Emergency check and action
      IF client_record.wallet_balance >= client_record.monthly_rate THEN
        -- Auto-renew
        SELECT process_subscription_renewal(client_record.id) INTO renewal_result;
        
        -- Update radius sync status for immediate reconnection
        UPDATE clients 
        SET radius_sync_status = 'pending', last_radius_sync_at = NULL
        WHERE id = client_record.id;
        
        -- Log successful renewal
        INSERT INTO notification_logs (
          client_id, trigger_event, type, channels, recipients, status, isp_company_id
        ) VALUES (
          client_record.id, 'auto_renewal_success', 'auto', 
          ARRAY['email', 'sms'], ARRAY[client_record.email, client_record.phone],
          'completed', client_record.isp_company_id
        );
      ELSE
        -- Insufficient balance: Schedule disconnection
        UPDATE clients 
        SET 
          status = 'suspended',
          radius_sync_status = 'pending',
          disconnection_scheduled_at = NOW()
        WHERE id = client_record.id;
        
        -- Send disconnection notification
        notification_type := 'service_disconnected';
      END IF;
      
    ELSIF minutes_until_expiry <= 1440 THEN -- 24 hours
      IF client_record.wallet_balance < client_record.monthly_rate THEN
        notification_type := 'final_payment_reminder';
      END IF;
      
    ELSIF minutes_until_expiry <= 2880 THEN -- 48 hours (2 days)
      IF client_record.wallet_balance < client_record.monthly_rate THEN
        notification_type := 'urgent_payment_reminder';
      END IF;
      
    ELSIF minutes_until_expiry <= 4320 THEN -- 72 hours (3 days)
      IF client_record.wallet_balance < client_record.monthly_rate THEN
        notification_type := 'payment_reminder';
      END IF;
    END IF;
    
    -- Send notification if needed
    IF notification_type IS NOT NULL THEN
      INSERT INTO notification_logs (
        client_id, trigger_event, type, channels, recipients, status, 
        isp_company_id
      ) VALUES (
        client_record.id, notification_type, 'auto',
        ARRAY['email', 'sms'], ARRAY[client_record.email, client_record.phone],
        'pending', client_record.isp_company_id
      );
      
      -- Call notification service
      PERFORM net.http_post(
        url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-auto-notifications',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
        body := jsonb_build_object(
          'client_id', client_record.id,
          'trigger_event', notification_type,
          'data', jsonb_build_object(
            'minutes_until_expiry', minutes_until_expiry,
            'current_balance', client_record.wallet_balance,
            'required_amount', client_record.monthly_rate,
            'package_name', client_record.package_name
          )
        )
      );
    END IF;
    
    -- Reset notification_type for next iteration
    notification_type := NULL;
  END LOOP;
END;
$$;

-- Create enhanced payment processing trigger
CREATE OR REPLACE FUNCTION public.handle_payment_activation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Get client details
  SELECT * INTO client_record FROM clients WHERE id = NEW.client_id;
  
  -- If payment makes client eligible for activation
  IF client_record.wallet_balance >= client_record.monthly_rate THEN
    -- Auto-activate if suspended due to insufficient funds
    IF client_record.status = 'suspended' THEN
      UPDATE clients 
      SET 
        status = 'active',
        radius_sync_status = 'pending',
        last_radius_sync_at = NULL
      WHERE id = NEW.client_id;
      
      -- Generate/update RADIUS credentials
      PERFORM generate_radius_credentials(NEW.client_id);
      
      -- Trigger immediate sync notification
      PERFORM net.http_post(
        url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-status-webhook',
        headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
        body := jsonb_build_object(
          'client_id', NEW.client_id,
          'status', 'active',
          'action', 'reconnect'
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for payment activation
DROP TRIGGER IF EXISTS trigger_payment_activation ON payments;
CREATE TRIGGER trigger_payment_activation
  AFTER INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION handle_payment_activation();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_clients_expiry_status ON clients(subscription_end_date, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_radius_users_client ON radius_users(client_id, is_active);
CREATE INDEX IF NOT EXISTS idx_notification_logs_client ON notification_logs(client_id, created_at);
