
-- Create missing tables for full network automation

-- MikroTik routers table
CREATE TABLE IF NOT EXISTS public.mikrotik_routers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  ip_address VARCHAR NOT NULL,
  admin_username VARCHAR NOT NULL DEFAULT 'admin',
  admin_password VARCHAR NOT NULL,
  snmp_community VARCHAR NOT NULL DEFAULT 'public',
  snmp_version INTEGER NOT NULL DEFAULT 2,
  pppoe_interface VARCHAR NOT NULL DEFAULT 'pppoe-server1',
  dns_servers VARCHAR NOT NULL DEFAULT '8.8.8.8,8.8.4.4',
  client_network VARCHAR NOT NULL DEFAULT '10.0.0.0/24',
  gateway VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  last_test_results JSONB,
  connection_status VARCHAR NOT NULL DEFAULT 'offline',
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Client network profiles table for network configuration
CREATE TABLE IF NOT EXISTS public.client_network_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  username VARCHAR NOT NULL,
  ip_pool VARCHAR DEFAULT 'dynamic',
  dns_servers VARCHAR DEFAULT '8.8.8.8,8.8.4.4',
  firewall_rules TEXT[],
  qos_profile VARCHAR,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RADIUS users table for authentication
CREATE TABLE IF NOT EXISTS public.radius_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  username VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  group_name VARCHAR DEFAULT 'default',
  max_upload VARCHAR,
  max_download VARCHAR,
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Network sessions table for live monitoring
CREATE TABLE IF NOT EXISTS public.network_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  username VARCHAR NOT NULL,
  session_id VARCHAR NOT NULL,
  ip_address INET,
  nas_ip_address INET,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'active',
  equipment_id UUID REFERENCES public.equipment(id),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for all tables
ALTER TABLE public.mikrotik_routers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_network_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their MikroTik routers" 
  ON public.mikrotik_routers 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their client network profiles" 
  ON public.client_network_profiles 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their RADIUS users" 
  ON public.radius_users 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their network sessions" 
  ON public.network_sessions 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Update the promote_inventory_to_equipment function to handle MikroTik routers
CREATE OR REPLACE FUNCTION public.promote_inventory_to_mikrotik_router(
  inventory_item_id UUID,
  router_data JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  router_id UUID;
  inventory_item RECORD;
BEGIN
  -- Get the inventory item
  SELECT * INTO inventory_item 
  FROM inventory_items 
  WHERE id = inventory_item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  -- Create MikroTik router record
  INSERT INTO mikrotik_routers (
    name, ip_address, admin_username, admin_password,
    snmp_community, snmp_version, pppoe_interface,
    dns_servers, client_network, gateway, status,
    isp_company_id
  ) VALUES (
    COALESCE(router_data->>'name', inventory_item.name, 'MikroTik Router'),
    router_data->>'ip_address',
    COALESCE(router_data->>'admin_username', 'admin'),
    router_data->>'admin_password',
    COALESCE(router_data->>'snmp_community', 'public'),
    COALESCE((router_data->>'snmp_version')::INTEGER, 2),
    COALESCE(router_data->>'pppoe_interface', 'pppoe-server1'),
    COALESCE(router_data->>'dns_servers', '8.8.8.8,8.8.4.4'),
    COALESCE(router_data->>'client_network', '10.0.0.0/24'),
    router_data->>'gateway',
    'pending',
    inventory_item.isp_company_id
  ) RETURNING id INTO router_id;
  
  -- Update inventory item to mark as promoted
  UPDATE inventory_items 
  SET status = 'Deployed',
      notes = COALESCE(notes, '') || ' - Promoted to MikroTik Router'
  WHERE id = inventory_item_id;
  
  RETURN router_id;
END;
$$;
