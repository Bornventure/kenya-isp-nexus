-- Simple table creation
CREATE TABLE radius_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    client_id UUID,
    router_id UUID,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error TEXT,
    isp_company_id UUID NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE radius_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    client_id UUID,
    router_id UUID,
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