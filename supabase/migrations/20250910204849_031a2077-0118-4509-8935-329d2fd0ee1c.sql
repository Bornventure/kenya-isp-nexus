-- Complete the missing RADIUS automation schema changes (fixed)

-- 1. Add missing columns to clients table
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS groupname TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS radius_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 2. Add missing columns to mikrotik_routers table  
ALTER TABLE mikrotik_routers
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 3. Create radius_events table for CoA + telemetry
CREATE TABLE IF NOT EXISTS radius_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    router_id UUID REFERENCES mikrotik_routers(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error TEXT,
    isp_company_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create radius_sessions table for session tracking  
CREATE TABLE IF NOT EXISTS radius_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    router_id UUID REFERENCES mikrotik_routers(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL UNIQUE,
    nas_ip_address INET,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    session_time INTEGER,
    input_octets BIGINT DEFAULT 0,
    output_octets BIGINT DEFAULT 0,
    terminate_cause TEXT,
    status TEXT DEFAULT 'active',
    isp_company_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE radius_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE radius_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for radius_events
CREATE POLICY "Company users can manage their radius events" 
ON radius_events 
FOR ALL 
USING (isp_company_id = get_current_user_company_id());

-- Create RLS policies for radius_sessions
CREATE POLICY "Company users can manage their radius sessions" 
ON radius_sessions 
FOR ALL 
USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_radius_events_client_id ON radius_events(client_id);
CREATE INDEX IF NOT EXISTS idx_radius_events_timestamp ON radius_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_client_id ON radius_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_session_id ON radius_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_radius_sessions_status ON radius_sessions(status);