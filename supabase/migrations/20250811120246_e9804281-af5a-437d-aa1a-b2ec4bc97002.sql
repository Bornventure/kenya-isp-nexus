
-- Create inventory categories table for standardized inventory management
CREATE TABLE public.inventory_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  minimum_stock_level INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert standard ISP equipment categories
INSERT INTO public.inventory_categories (name, description, minimum_stock_level) VALUES
('Routers', 'Network routing equipment for ISP operations', 5),
('Switches', 'Network switching equipment', 8),
('Access Points', 'Wireless access points for client connectivity', 10),
('Fiber Optic Cables', 'Fiber optic cables for backbone connectivity', 15),
('Ethernet Cables', 'Cat5e/Cat6 cables for network connections', 20),
('ONT/CPE Devices', 'Customer premises equipment', 25),
('Power Supplies', 'UPS and power equipment', 8),
('Antennas', 'Wireless communication antennas', 12),
('Transceivers', 'SFP/SFP+ optical transceivers', 15),
('Network Tools', 'Installation and maintenance tools', 5);

-- Create RADIUS server configuration table
CREATE TABLE public.radius_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  server_address INET NOT NULL,
  auth_port INTEGER NOT NULL DEFAULT 1812,
  accounting_port INTEGER NOT NULL DEFAULT 1813,
  shared_secret VARCHAR(255) NOT NULL,
  timeout_seconds INTEGER NOT NULL DEFAULT 30,
  retry_attempts INTEGER NOT NULL DEFAULT 3,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS user groups table
CREATE TABLE public.radius_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  upload_limit_mbps INTEGER NOT NULL DEFAULT 10,
  download_limit_mbps INTEGER NOT NULL DEFAULT 10,
  session_timeout_seconds INTEGER DEFAULT 86400,
  idle_timeout_seconds INTEGER DEFAULT 300,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS users table
CREATE TABLE public.radius_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  group_name VARCHAR(100) REFERENCES radius_groups(name),
  max_upload VARCHAR(20) DEFAULT '10M',
  max_download VARCHAR(20) DEFAULT '10M',
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS sessions table for tracking active connections
CREATE TABLE public.radius_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  client_id UUID REFERENCES clients(id),
  nas_ip_address INET,
  nas_port_id VARCHAR(50),
  framed_ip_address INET,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  packets_in BIGINT DEFAULT 0,
  packets_out BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES isp_companies(id)
);

-- Create network access servers (NAS) table
CREATE TABLE public.nas_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  shortname VARCHAR(50) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'other',
  ports INTEGER DEFAULT 1812,
  secret VARCHAR(255) NOT NULL,
  server VARCHAR(100),
  community VARCHAR(50) DEFAULT 'public',
  description TEXT,
  nas_ip_address INET NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nas_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory categories (company-scoped)
CREATE POLICY "Users can view inventory categories" ON public.inventory_categories FOR SELECT USING (true);

-- RLS policies for RADIUS tables (company-scoped)
CREATE POLICY "Company users can manage their RADIUS servers" ON public.radius_servers 
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their RADIUS groups" ON public.radius_groups 
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their RADIUS users" ON public.radius_users 
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can view their RADIUS sessions" ON public.radius_sessions 
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their NAS clients" ON public.nas_clients 
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create view for low stock items based on categories
CREATE VIEW public.low_stock_view AS
SELECT 
  ic.name as category_name,
  ic.minimum_stock_level,
  COALESCE(stock_count.current_stock, 0) as current_stock,
  (ic.minimum_stock_level - COALESCE(stock_count.current_stock, 0)) as stock_shortage,
  ic.id as category_id
FROM public.inventory_categories ic
LEFT JOIN (
  SELECT 
    category,
    SUM(COALESCE(quantity_in_stock, 0)) as current_stock
  FROM public.inventory_items
  WHERE status = 'In Stock'
  GROUP BY category
) stock_count ON ic.name = stock_count.category
WHERE COALESCE(stock_count.current_stock, 0) < ic.minimum_stock_level;

-- Insert default RADIUS groups for common packages
INSERT INTO public.radius_groups (name, description, upload_limit_mbps, download_limit_mbps, isp_company_id)
SELECT 'basic', 'Basic Internet Package', 5, 10, id FROM isp_companies WHERE is_active = true;

INSERT INTO public.radius_groups (name, description, upload_limit_mbps, download_limit_mbps, isp_company_id)
SELECT 'premium', 'Premium Internet Package', 20, 50, id FROM isp_companies WHERE is_active = true;

INSERT INTO public.radius_groups (name, description, upload_limit_mbps, download_limit_mbps, isp_company_id)
SELECT 'enterprise', 'Enterprise Internet Package', 100, 200, id FROM isp_companies WHERE is_active = true;
