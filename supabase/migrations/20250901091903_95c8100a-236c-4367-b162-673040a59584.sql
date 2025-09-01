
-- Create RADIUS servers table to store RADIUS configuration for MikroTik routers
CREATE TABLE IF NOT EXISTS public.radius_servers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name character varying NOT NULL,
  server_address inet NOT NULL,
  auth_port integer NOT NULL DEFAULT 1812,
  accounting_port integer NOT NULL DEFAULT 1813,
  shared_secret text NOT NULL,
  timeout_seconds integer DEFAULT 30,
  is_enabled boolean DEFAULT true,
  is_primary boolean DEFAULT false,
  router_id uuid REFERENCES public.mikrotik_routers(id) ON DELETE CASCADE,
  isp_company_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  last_synced_at timestamp with time zone,
  UNIQUE(router_id) -- One RADIUS config per router
);

-- Enable RLS
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their RADIUS servers" 
  ON public.radius_servers 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id())
  WITH CHECK (isp_company_id = get_current_user_company_id());

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_radius_servers_router_id ON public.radius_servers(router_id);
CREATE INDEX IF NOT EXISTS idx_radius_servers_company_id ON public.radius_servers(isp_company_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_radius_servers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_radius_servers_updated_at
  BEFORE UPDATE ON public.radius_servers
  FOR EACH ROW EXECUTE FUNCTION update_radius_servers_updated_at();
