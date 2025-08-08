
-- Create RADIUS users table for storing PPPoE credentials
CREATE TABLE IF NOT EXISTS public.radius_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  username VARCHAR(64) NOT NULL UNIQUE,
  password VARCHAR(128) NOT NULL,
  group_name VARCHAR(64),
  max_upload VARCHAR(32),
  max_download VARCHAR(32),
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS sessions table for tracking active connections
CREATE TABLE IF NOT EXISTS public.radius_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  username VARCHAR(64) NOT NULL,
  session_id VARCHAR(128) NOT NULL,
  nas_ip_address INET,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  status VARCHAR(32) DEFAULT 'active',
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create MikroTik routers configuration table
CREATE TABLE IF NOT EXISTS public.mikrotik_routers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  admin_username VARCHAR(128) NOT NULL,
  admin_password VARCHAR(128) NOT NULL,
  snmp_community VARCHAR(64) DEFAULT 'public',
  snmp_version INTEGER DEFAULT 2,
  pppoe_interface VARCHAR(64) DEFAULT 'pppoe-server1',
  dns_servers TEXT DEFAULT '8.8.8.8,8.8.4.4',
  client_network CIDR DEFAULT '10.0.0.0/24',
  gateway INET,
  status VARCHAR(32) DEFAULT 'pending',
  last_test_results JSONB,
  connection_status VARCHAR(32) DEFAULT 'offline',
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS accounting table for usage tracking
CREATE TABLE IF NOT EXISTS public.radius_accounting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(64) NOT NULL,
  session_id VARCHAR(128) NOT NULL,
  nas_ip_address INET,
  nas_port INTEGER,
  acct_status_type VARCHAR(32),
  acct_input_octets BIGINT DEFAULT 0,
  acct_output_octets BIGINT DEFAULT 0,
  acct_session_time INTEGER DEFAULT 0,
  framed_ip_address INET,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES isp_companies(id)
);

-- Enable RLS on all tables
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mikrotik_routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_accounting ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their RADIUS users" 
  ON public.radius_users 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their RADIUS sessions" 
  ON public.radius_sessions 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their MikroTik routers" 
  ON public.mikrotik_routers 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can view their RADIUS accounting" 
  ON public.radius_accounting 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Create function to automatically create RADIUS user when client is activated
CREATE OR REPLACE FUNCTION create_radius_user_on_activation()
RETURNS TRIGGER AS $$
DECLARE
  service_pkg RECORD;
  radius_username TEXT;
  radius_password TEXT;
BEGIN
  -- Only proceed if client status changed to active
  IF OLD.status != 'active' AND NEW.status = 'active' AND NEW.service_package_id IS NOT NULL THEN
    -- Get service package details
    SELECT * INTO service_pkg FROM service_packages WHERE id = NEW.service_package_id;
    
    IF FOUND THEN
      -- Generate username and password
      radius_username := COALESCE(NEW.email, NEW.phone);
      radius_password := substring(md5(random()::text) from 1 for 8);
      
      -- Create RADIUS user
      INSERT INTO radius_users (
        client_id,
        username,
        password,
        group_name,
        max_upload,
        max_download,
        expiration,
        is_active,
        isp_company_id
      ) VALUES (
        NEW.id,
        radius_username,
        radius_password,
        lower(replace(service_pkg.name, ' ', '_')),
        CASE 
          WHEN service_pkg.speed ~ '^(\d+)\s*Mbps' THEN 
            (regexp_match(service_pkg.speed, '^(\d+)\s*Mbps'))[1] || 'M'
          ELSE '10M'
        END,
        service_pkg.speed,
        NEW.subscription_end_date,
        true,
        NEW.isp_company_id
      ) ON CONFLICT (username) DO UPDATE SET
        password = EXCLUDED.password,
        group_name = EXCLUDED.group_name,
        max_upload = EXCLUDED.max_upload,
        max_download = EXCLUDED.max_download,
        expiration = EXCLUDED.expiration,
        is_active = EXCLUDED.is_active,
        updated_at = now();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS radius_user_activation_trigger ON clients;
CREATE TRIGGER radius_user_activation_trigger
  AFTER UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_radius_user_on_activation();

-- Create function to disable RADIUS user when client is suspended
CREATE OR REPLACE FUNCTION disable_radius_user_on_suspension()
RETURNS TRIGGER AS $$
BEGIN
  -- Disable RADIUS user when client is suspended
  IF OLD.status = 'active' AND NEW.status = 'suspended' THEN
    UPDATE radius_users 
    SET is_active = false, updated_at = now()
    WHERE client_id = NEW.id;
    
    -- End active sessions
    UPDATE radius_sessions 
    SET status = 'terminated', end_time = now()
    WHERE client_id = NEW.id AND status = 'active';
  END IF;
  
  -- Re-enable RADIUS user when client is reactivated
  IF OLD.status = 'suspended' AND NEW.status = 'active' THEN
    UPDATE radius_users 
    SET is_active = true, updated_at = now()
    WHERE client_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for suspension/reactivation
DROP TRIGGER IF EXISTS radius_user_suspension_trigger ON clients;
CREATE TRIGGER radius_user_suspension_trigger
  AFTER UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION disable_radius_user_on_suspension();
