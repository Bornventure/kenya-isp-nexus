
-- Create hotspots table
CREATE TABLE public.hotspots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  hardware_details JSONB,
  ip_address INET,
  mac_address VARCHAR(17),
  ssid VARCHAR(255) NOT NULL,
  password VARCHAR(255),
  bandwidth_limit INTEGER DEFAULT 10, -- Mbps
  max_concurrent_users INTEGER DEFAULT 50,
  coverage_radius INTEGER DEFAULT 100, -- meters
  installation_date DATE,
  last_maintenance_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hotspot_sessions table for usage tracking
CREATE TABLE public.hotspot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL,
  client_id UUID, -- NULL for guest users
  mac_address VARCHAR(17) NOT NULL,
  device_fingerprint TEXT,
  session_type VARCHAR(20) NOT NULL DEFAULT 'guest', -- 'client', 'guest', 'voucher'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  data_used_mb NUMERIC DEFAULT 0,
  bandwidth_used_mbps NUMERIC DEFAULT 0,
  session_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'expired', 'terminated'
  ip_address INET,
  user_agent TEXT,
  payment_reference VARCHAR(255), -- For paid guest sessions
  voucher_code VARCHAR(50), -- For voucher-based access
  isp_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create client_hotspot_access table for automatic authentication
CREATE TABLE public.client_hotspot_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  hotspot_id UUID NOT NULL,
  mac_address VARCHAR(17) NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50), -- 'mobile', 'laptop', 'tablet', etc.
  auto_connect BOOLEAN NOT NULL DEFAULT true,
  bandwidth_allocation INTEGER DEFAULT 5, -- Mbps per device
  access_level VARCHAR(20) NOT NULL DEFAULT 'standard', -- 'standard', 'premium', 'unlimited'
  first_connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_connected_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  total_data_used_mb NUMERIC DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_reason TEXT,
  isp_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(client_id, hotspot_id, mac_address)
);

-- Create hotspot_vouchers table for guest access
CREATE TABLE public.hotspot_vouchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL,
  voucher_code VARCHAR(20) NOT NULL UNIQUE,
  voucher_type VARCHAR(20) NOT NULL DEFAULT 'time_based', -- 'time_based', 'data_based', 'unlimited'
  duration_minutes INTEGER, -- For time-based vouchers
  data_limit_mb INTEGER, -- For data-based vouchers
  price NUMERIC NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'KES',
  max_devices INTEGER DEFAULT 1,
  expiry_date TIMESTAMP WITH TIME ZONE,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by_mac VARCHAR(17),
  payment_reference VARCHAR(255),
  mpesa_receipt_number VARCHAR(255),
  generated_by UUID, -- Staff member who generated it
  isp_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create hotspot_analytics table for performance tracking
CREATE TABLE public.hotspot_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotspot_id UUID NOT NULL,
  date DATE NOT NULL,
  total_sessions INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  total_data_used_gb NUMERIC DEFAULT 0,
  peak_concurrent_users INTEGER DEFAULT 0,
  avg_session_duration_minutes NUMERIC DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  uptime_percentage NUMERIC DEFAULT 100,
  bandwidth_utilization_percentage NUMERIC DEFAULT 0,
  guest_sessions INTEGER DEFAULT 0,
  client_sessions INTEGER DEFAULT 0,
  voucher_sessions INTEGER DEFAULT 0,
  isp_company_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(hotspot_id, date)
);

-- Add foreign key constraints
ALTER TABLE public.hotspot_sessions 
ADD CONSTRAINT fk_hotspot_sessions_hotspot FOREIGN KEY (hotspot_id) REFERENCES public.hotspots(id) ON DELETE CASCADE;

ALTER TABLE public.client_hotspot_access 
ADD CONSTRAINT fk_client_hotspot_access_client FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_client_hotspot_access_hotspot FOREIGN KEY (hotspot_id) REFERENCES public.hotspots(id) ON DELETE CASCADE;

ALTER TABLE public.hotspot_vouchers 
ADD CONSTRAINT fk_hotspot_vouchers_hotspot FOREIGN KEY (hotspot_id) REFERENCES public.hotspots(id) ON DELETE CASCADE;

ALTER TABLE public.hotspot_analytics 
ADD CONSTRAINT fk_hotspot_analytics_hotspot FOREIGN KEY (hotspot_id) REFERENCES public.hotspots(id) ON DELETE CASCADE;

-- Enable RLS on all tables
ALTER TABLE public.hotspots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_hotspot_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotspot_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for company isolation
CREATE POLICY "Companies can manage their own hotspots" ON public.hotspots
FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Companies can view their own hotspot sessions" ON public.hotspot_sessions
FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Companies can manage their own client hotspot access" ON public.client_hotspot_access
FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Companies can manage their own hotspot vouchers" ON public.hotspot_vouchers
FOR ALL USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Companies can view their own hotspot analytics" ON public.hotspot_analytics
FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create indexes for performance
CREATE INDEX idx_hotspots_company ON public.hotspots(isp_company_id);
CREATE INDEX idx_hotspots_status ON public.hotspots(status) WHERE is_active = true;
CREATE INDEX idx_hotspots_location ON public.hotspots(latitude, longitude) WHERE is_active = true;

CREATE INDEX idx_hotspot_sessions_hotspot ON public.hotspot_sessions(hotspot_id);
CREATE INDEX idx_hotspot_sessions_client ON public.hotspot_sessions(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX idx_hotspot_sessions_mac ON public.hotspot_sessions(mac_address);
CREATE INDEX idx_hotspot_sessions_active ON public.hotspot_sessions(hotspot_id, session_status) WHERE session_status = 'active';
CREATE INDEX idx_hotspot_sessions_time ON public.hotspot_sessions(start_time, end_time);

CREATE INDEX idx_client_hotspot_access_client ON public.client_hotspot_access(client_id);
CREATE INDEX idx_client_hotspot_access_hotspot ON public.client_hotspot_access(hotspot_id);
CREATE INDEX idx_client_hotspot_access_mac ON public.client_hotspot_access(mac_address);

CREATE INDEX idx_hotspot_vouchers_code ON public.hotspot_vouchers(voucher_code);
CREATE INDEX idx_hotspot_vouchers_hotspot ON public.hotspot_vouchers(hotspot_id);
CREATE INDEX idx_hotspot_vouchers_unused ON public.hotspot_vouchers(hotspot_id, is_used) WHERE is_used = false;

CREATE INDEX idx_hotspot_analytics_hotspot_date ON public.hotspot_analytics(hotspot_id, date);
CREATE INDEX idx_hotspot_analytics_company_date ON public.hotspot_analytics(isp_company_id, date);

-- Function to generate unique voucher codes
CREATE OR REPLACE FUNCTION generate_voucher_code() 
RETURNS TEXT 
LANGUAGE plpgsql 
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$;

-- Function to automatically end expired sessions
CREATE OR REPLACE FUNCTION end_expired_sessions()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- End time-based sessions that have exceeded their duration
    UPDATE hotspot_sessions 
    SET session_status = 'expired',
        end_time = now(),
        duration_minutes = EXTRACT(EPOCH FROM (now() - start_time)) / 60
    WHERE session_status = 'active'
    AND session_type IN ('voucher', 'guest')
    AND start_time + INTERVAL '1 minute' * (
        SELECT COALESCE(hv.duration_minutes, 60) 
        FROM hotspot_vouchers hv 
        WHERE hv.voucher_code = hotspot_sessions.voucher_code
        UNION ALL
        SELECT 60 -- Default 1 hour for guest sessions without voucher
        LIMIT 1
    ) < now();
    
    -- End sessions that have exceeded data limits (placeholder for future implementation)
    -- This would require real-time data tracking integration
END;
$$;
