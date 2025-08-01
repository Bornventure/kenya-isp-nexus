
-- Create audit_logs table for user action tracking
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_email VARCHAR(255),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  changes JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_logs table for system events
CREATE TABLE public.system_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL CHECK (level IN ('info', 'warning', 'error', 'critical')),
  category VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source VARCHAR(100) NOT NULL,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create radius_users table for RADIUS authentication
CREATE TABLE public.radius_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  group_name VARCHAR(100),
  max_upload VARCHAR(20),
  max_download VARCHAR(20),
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create radius_sessions table for tracking active sessions
CREATE TABLE public.radius_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  nas_ip_address INET,
  session_id VARCHAR(255),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'stopped')),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create data_usage table for client data tracking
CREATE TABLE public.data_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'monthly')),
  period_start DATE NOT NULL,
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  total_bytes BIGINT DEFAULT 0,
  data_allowance BIGINT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, period, period_start)
);

-- Create usage_alerts table for data usage alerts
CREATE TABLE public.usage_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) NOT NULL,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('approaching_limit', 'exceeded_limit', 'unusual_usage')),
  threshold_percentage NUMERIC,
  current_usage_bytes BIGINT,
  message TEXT,
  is_resolved BOOLEAN DEFAULT false,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create network_device_stats table for device monitoring
CREATE TABLE public.network_device_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID REFERENCES public.equipment(id) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('online', 'offline', 'warning')),
  uptime BIGINT DEFAULT 0,
  cpu_usage NUMERIC DEFAULT 0,
  memory_usage NUMERIC DEFAULT 0,
  connected_clients INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can view their audit logs" ON public.audit_logs
  FOR SELECT USING (isp_company_id = get_current_user_company_id());
CREATE POLICY "Company users can insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (isp_company_id = get_current_user_company_id());

-- Add RLS policies for system_logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can view their system logs" ON public.system_logs
  FOR SELECT USING (isp_company_id = get_current_user_company_id());
CREATE POLICY "Company users can insert system logs" ON public.system_logs
  FOR INSERT WITH CHECK (isp_company_id = get_current_user_company_id());

-- Add RLS policies for radius_users
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their RADIUS users" ON public.radius_users
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for radius_sessions
ALTER TABLE public.radius_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can view their RADIUS sessions" ON public.radius_sessions
  FOR SELECT USING (isp_company_id = get_current_user_company_id());
CREATE POLICY "Company users can insert RADIUS sessions" ON public.radius_sessions
  FOR INSERT WITH CHECK (isp_company_id = get_current_user_company_id());

-- Add RLS policies for data_usage
ALTER TABLE public.data_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their data usage" ON public.data_usage
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for usage_alerts
ALTER TABLE public.usage_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their usage alerts" ON public.usage_alerts
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for network_device_stats
ALTER TABLE public.network_device_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their device stats" ON public.network_device_stats
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create indexes for better performance
CREATE INDEX idx_audit_logs_company_id ON public.audit_logs(isp_company_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON public.audit_logs(timestamp);
CREATE INDEX idx_system_logs_company_id ON public.system_logs(isp_company_id);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_radius_users_client_id ON public.radius_users(client_id);
CREATE INDEX idx_radius_sessions_username ON public.radius_sessions(username);
CREATE INDEX idx_data_usage_client_period ON public.data_usage(client_id, period, period_start);
CREATE INDEX idx_usage_alerts_client_id ON public.usage_alerts(client_id);
CREATE INDEX idx_network_device_stats_device_id ON public.network_device_stats(device_id);
