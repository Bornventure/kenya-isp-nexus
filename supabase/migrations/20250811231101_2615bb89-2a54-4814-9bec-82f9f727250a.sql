
-- Create RADIUS servers table
CREATE TABLE public.radius_servers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  server_address VARCHAR(255) NOT NULL,
  auth_port INTEGER NOT NULL DEFAULT 1812,
  accounting_port INTEGER NOT NULL DEFAULT 1813,
  shared_secret VARCHAR(255) NOT NULL,
  timeout_seconds INTEGER NOT NULL DEFAULT 5,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RADIUS groups table
CREATE TABLE public.radius_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  upload_limit_mbps INTEGER NOT NULL DEFAULT 1,
  download_limit_mbps INTEGER NOT NULL DEFAULT 1,
  session_timeout_seconds INTEGER,
  idle_timeout_seconds INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create NAS clients table
CREATE TABLE public.nas_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  shortname VARCHAR(100) NOT NULL,
  type VARCHAR(100) NOT NULL DEFAULT 'other',
  nas_ip_address VARCHAR(45) NOT NULL,
  secret VARCHAR(255) NOT NULL,
  ports INTEGER NOT NULL DEFAULT 1645,
  community VARCHAR(100) NOT NULL DEFAULT 'public',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nas_clients ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their RADIUS servers"
  ON public.radius_servers
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their RADIUS groups"
  ON public.radius_groups
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their NAS clients"
  ON public.nas_clients
  FOR ALL
  USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX idx_radius_servers_company ON public.radius_servers(isp_company_id);
CREATE INDEX idx_radius_groups_company ON public.radius_groups(isp_company_id);
CREATE INDEX idx_nas_clients_company ON public.nas_clients(isp_company_id);
CREATE INDEX idx_nas_clients_ip ON public.nas_clients(nas_ip_address);

-- Add constraint to ensure only one primary RADIUS server per company
CREATE UNIQUE INDEX idx_radius_servers_primary_unique 
ON public.radius_servers(isp_company_id) 
WHERE is_primary = true;
