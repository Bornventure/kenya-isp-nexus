
-- Create table to store MikroTik router configurations
CREATE TABLE mikrotik_routers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  admin_username VARCHAR(100) NOT NULL,
  admin_password VARCHAR(255) NOT NULL,
  snmp_community VARCHAR(100) DEFAULT 'public',
  snmp_version INTEGER DEFAULT 2,
  pppoe_interface VARCHAR(50) DEFAULT 'ether1',
  dns_servers VARCHAR(255) DEFAULT '8.8.8.8,8.8.4.4',
  client_network CIDR DEFAULT '10.10.0.0/16',
  gateway INET DEFAULT '192.168.1.1',
  status VARCHAR(20) DEFAULT 'pending',
  last_test_results JSONB DEFAULT '{}',
  connection_status VARCHAR(20) DEFAULT 'offline',
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(ip_address, isp_company_id)
);

-- Enable RLS
ALTER TABLE mikrotik_routers ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Company users can manage their routers" ON mikrotik_routers
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create table for RADIUS users (for MikroTik PPPoE integration)
CREATE TABLE radius_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  username VARCHAR(100) NOT NULL,
  password VARCHAR(100) NOT NULL,
  group_name VARCHAR(100),
  max_upload VARCHAR(20),
  max_download VARCHAR(20),
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(username, isp_company_id)
);

-- Enable RLS for RADIUS users
ALTER TABLE radius_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for RADIUS users
CREATE POLICY "Company users can manage their RADIUS users" ON radius_users
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create table for RADIUS sessions tracking
CREATE TABLE radius_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  nas_ip_address INET NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for RADIUS sessions
ALTER TABLE radius_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for RADIUS sessions
CREATE POLICY "Company users can view their RADIUS sessions" ON radius_sessions
  FOR ALL USING (isp_company_id = get_current_user_company_id());
