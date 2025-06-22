
-- Create missing tables for QoS policies and client service assignments
CREATE TABLE public.qos_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  max_bandwidth_down INTEGER NOT NULL,
  max_bandwidth_up INTEGER NOT NULL,
  priority VARCHAR CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
  burst_size INTEGER,
  guaranteed_bandwidth INTEGER,
  protocol VARCHAR CHECK (protocol IN ('tcp', 'udp', 'both')) DEFAULT 'both',
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client service assignments table
CREATE TABLE public.client_service_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) NOT NULL,
  service_package_id UUID REFERENCES service_packages(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create interface statistics table for SNMP monitoring
CREATE TABLE public.interface_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  interface_index INTEGER NOT NULL,
  interface_name VARCHAR NOT NULL,
  status VARCHAR CHECK (status IN ('up', 'down', 'testing')) DEFAULT 'down',
  utilization NUMERIC DEFAULT 0,
  errors INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES isp_companies(id)
);

-- Create bandwidth statistics table for monitoring
CREATE TABLE public.bandwidth_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  in_octets BIGINT DEFAULT 0,
  out_octets BIGINT DEFAULT 0,
  in_packets BIGINT DEFAULT 0,
  out_packets BIGINT DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES isp_companies(id)
);

-- Add missing columns to equipment table
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS firmware_version VARCHAR,
ADD COLUMN IF NOT EXISTS location VARCHAR;

-- Enable RLS on new tables
ALTER TABLE public.qos_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_service_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interface_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bandwidth_statistics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Company users can view their QoS policies" ON public.qos_policies
  FOR SELECT USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their QoS policies" ON public.qos_policies
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can view their client assignments" ON public.client_service_assignments
  FOR SELECT USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their client assignments" ON public.client_service_assignments
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can view their interface stats" ON public.interface_statistics
  FOR SELECT USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their interface stats" ON public.interface_statistics
  FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can view their bandwidth stats" ON public.bandwidth_statistics
  FOR SELECT USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their bandwidth stats" ON public.bandwidth_statistics
  FOR ALL USING (isp_company_id = get_current_user_company_id());
