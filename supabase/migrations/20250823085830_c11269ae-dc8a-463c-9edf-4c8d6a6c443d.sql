
-- Create radius_users table to match your EC2 schema
CREATE TABLE IF NOT EXISTS public.radius_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  group_name VARCHAR(255) DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  client_id VARCHAR(255),
  isp_company_id UUID NOT NULL,
  max_download VARCHAR(50) DEFAULT '5120',
  max_upload VARCHAR(50) DEFAULT '512',
  expiration TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create radius_accounting table for session tracking
CREATE TABLE IF NOT EXISTS public.radius_accounting (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  nas_ip_address INET NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  session_time INTEGER DEFAULT 0,
  input_octets BIGINT DEFAULT 0,
  output_octets BIGINT DEFAULT 0,
  terminate_cause VARCHAR(255),
  client_id VARCHAR(255),
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create active_sessions table for real-time session tracking
CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  nas_ip_address INET NOT NULL,
  framed_ip_address INET,
  calling_station_id VARCHAR(255),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  client_id VARCHAR(255),
  isp_company_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for radius_users
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their radius users" 
  ON public.radius_users 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for radius_accounting
ALTER TABLE public.radius_accounting ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their radius accounting" 
  ON public.radius_accounting 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for active_sessions
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Company users can manage their active sessions" 
  ON public.active_sessions 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_radius_users_company ON radius_users(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_radius_users_username ON radius_users(username);
CREATE INDEX IF NOT EXISTS idx_radius_users_client ON radius_users(client_id);

CREATE INDEX IF NOT EXISTS idx_radius_accounting_company ON radius_accounting(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_radius_accounting_username ON radius_accounting(username);
CREATE INDEX IF NOT EXISTS idx_radius_accounting_session ON radius_accounting(session_id);

CREATE INDEX IF NOT EXISTS idx_active_sessions_company ON active_sessions(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_username ON active_sessions(username);
CREATE INDEX IF NOT EXISTS idx_active_sessions_nas ON active_sessions(nas_ip_address);
