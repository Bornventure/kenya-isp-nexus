
-- Update existing RADIUS tables to match EC2 instance schema with ISP support
-- Note: This assumes your tables already exist, so we're adding missing columns

-- Add ISP company support to existing radius_users table
ALTER TABLE public.radius_users 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS isp_company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add ISP company support to existing radius_accounting table  
ALTER TABLE public.radius_accounting
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS isp_company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Add ISP company support to existing active_sessions table
ALTER TABLE public.active_sessions
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id),
ADD COLUMN IF NOT EXISTS isp_company_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000';

-- Enable RLS on RADIUS tables
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for radius_users
CREATE POLICY "Company users can manage their RADIUS users"
  ON public.radius_users
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Create RLS policies for radius_accounting
CREATE POLICY "Company users can manage their RADIUS accounting"
  ON public.radius_accounting
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Create RLS policies for active_sessions
CREATE POLICY "Company users can manage their active sessions"
  ON public.active_sessions
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_radius_users_username ON public.radius_users(username);
CREATE INDEX IF NOT EXISTS idx_radius_users_company ON public.radius_users(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_radius_accounting_username ON public.radius_accounting(username);
CREATE INDEX IF NOT EXISTS idx_radius_accounting_company ON public.radius_accounting(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_username ON public.active_sessions(username);
CREATE INDEX IF NOT EXISTS idx_active_sessions_company ON public.active_sessions(isp_company_id);
