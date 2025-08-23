
-- RADIUS users sync table
CREATE TABLE radius_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(64) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    profile VARCHAR(32) DEFAULT 'default',
    status VARCHAR(20) DEFAULT 'active',
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    isp_company_id UUID REFERENCES isp_companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RADIUS accounting mirror
CREATE TABLE radius_accounting (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(64),
    nas_ip_address INET,
    session_id VARCHAR(64),
    session_time INTEGER,
    input_octets BIGINT,
    output_octets BIGINT,
    terminate_cause VARCHAR(32),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    isp_company_id UUID REFERENCES isp_companies(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session tracking
CREATE TABLE active_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(64),
    nas_ip_address INET,
    framed_ip_address INET,
    calling_station_id VARCHAR(64),
    session_start TIMESTAMPTZ DEFAULT NOW(),
    last_update TIMESTAMPTZ DEFAULT NOW(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    isp_company_id UUID REFERENCES isp_companies(id) ON DELETE CASCADE
);

-- Enable RLS on all tables
ALTER TABLE radius_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE radius_accounting ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for radius_users
CREATE POLICY "Company users can manage their RADIUS users" 
ON radius_users FOR ALL 
USING (isp_company_id = get_current_user_company_id());

-- RLS policies for radius_accounting
CREATE POLICY "Company users can view their RADIUS accounting" 
ON radius_accounting FOR ALL 
USING (isp_company_id = get_current_user_company_id());

-- RLS policies for active_sessions
CREATE POLICY "Company users can manage their active sessions" 
ON active_sessions FOR ALL 
USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX idx_radius_users_username ON radius_users(username);
CREATE INDEX idx_radius_users_company ON radius_users(isp_company_id);
CREATE INDEX idx_radius_accounting_username ON radius_accounting(username);
CREATE INDEX idx_radius_accounting_company ON radius_accounting(isp_company_id);
CREATE INDEX idx_active_sessions_username ON active_sessions(username);
CREATE INDEX idx_active_sessions_company ON active_sessions(isp_company_id);

-- Update trigger for radius_users
CREATE OR REPLACE FUNCTION update_radius_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER radius_users_updated_at
    BEFORE UPDATE ON radius_users
    FOR EACH ROW
    EXECUTE FUNCTION update_radius_users_updated_at();
