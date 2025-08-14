
-- Create network agents table for on-premise network testing agents
CREATE TABLE public.network_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  ip_address INET NOT NULL,
  port INTEGER DEFAULT 8080,
  api_key VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'offline',
  last_heartbeat TIMESTAMP WITH TIME ZONE,
  capabilities JSONB DEFAULT '[]',
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create network tasks table for queuing network operations
CREATE TABLE public.network_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.network_agents(id),
  task_type VARCHAR(100) NOT NULL, -- 'ping', 'snmp_test', 'mikrotik_connect', 'speed_test'
  target_ip INET NOT NULL,
  target_config JSONB DEFAULT '{}', -- community, username, password, etc.
  priority INTEGER DEFAULT 5,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  scheduled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  timeout_seconds INTEGER DEFAULT 30,
  created_by UUID REFERENCES auth.users(id),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create network task results table for storing test results
CREATE TABLE public.network_task_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.network_tasks(id),
  success BOOLEAN NOT NULL,
  response_time_ms INTEGER,
  result_data JSONB DEFAULT '{}',
  error_message TEXT,
  raw_response TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS servers table
CREATE TABLE public.radius_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  server_address VARCHAR(255) NOT NULL,
  auth_port INTEGER DEFAULT 1812,
  accounting_port INTEGER DEFAULT 1813,
  shared_secret VARCHAR(255) NOT NULL,
  timeout_seconds INTEGER DEFAULT 5,
  is_enabled BOOLEAN DEFAULT true,
  is_primary BOOLEAN DEFAULT false,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS groups table
CREATE TABLE public.radius_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  upload_limit_mbps INTEGER DEFAULT 10,
  download_limit_mbps INTEGER DEFAULT 10,
  session_timeout_seconds INTEGER,
  idle_timeout_seconds INTEGER,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create NAS clients table
CREATE TABLE public.nas_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  shortname VARCHAR(100) NOT NULL,
  type VARCHAR(100) DEFAULT 'other',
  nas_ip_address INET NOT NULL,
  secret VARCHAR(255) NOT NULL,
  ports INTEGER DEFAULT 1812,
  community VARCHAR(100) DEFAULT 'public',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create RADIUS users table
CREATE TABLE public.radius_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  group_name VARCHAR(255) DEFAULT 'default',
  max_upload VARCHAR(50) DEFAULT '10M',
  max_download VARCHAR(50) DEFAULT '10M',
  expiration TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create network sessions table for tracking active connections
CREATE TABLE public.network_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id),
  username VARCHAR(255) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  ip_address INET,
  nas_ip_address INET,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  bytes_in BIGINT DEFAULT 0,
  bytes_out BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'disconnected'
  equipment_id UUID REFERENCES public.equipment(id),
  last_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for network agents
ALTER TABLE public.network_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their network agents" ON public.network_agents
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for network tasks
ALTER TABLE public.network_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their network tasks" ON public.network_tasks
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for network task results
ALTER TABLE public.network_task_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can view their network task results" ON public.network_task_results
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.network_tasks nt 
    WHERE nt.id = network_task_results.task_id 
    AND nt.isp_company_id = get_current_user_company_id()
  ));

-- Add RLS policies for RADIUS tables
ALTER TABLE public.radius_servers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their RADIUS servers" ON public.radius_servers
  FOR ALL USING (isp_company_id = get_current_user_company_id());

ALTER TABLE public.radius_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their RADIUS groups" ON public.radius_groups
  FOR ALL USING (isp_company_id = get_current_user_company_id());

ALTER TABLE public.nas_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their NAS clients" ON public.nas_clients
  FOR ALL USING (isp_company_id = get_current_user_company_id());

ALTER TABLE public.radius_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their RADIUS users" ON public.radius_users
  FOR ALL USING (isp_company_id = get_current_user_company_id());

ALTER TABLE public.network_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Company users can manage their network sessions" ON public.network_sessions
  FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Create indexes for better performance
CREATE INDEX idx_network_agents_company ON public.network_agents(isp_company_id);
CREATE INDEX idx_network_tasks_agent ON public.network_tasks(agent_id);
CREATE INDEX idx_network_tasks_status ON public.network_tasks(status);
CREATE INDEX idx_network_task_results_task ON public.network_task_results(task_id);
CREATE INDEX idx_radius_users_client ON public.radius_users(client_id);
CREATE INDEX idx_network_sessions_client ON public.network_sessions(client_id);
CREATE INDEX idx_network_sessions_status ON public.network_sessions(status);

-- Function to create a network task
CREATE OR REPLACE FUNCTION create_network_task(
  p_task_type VARCHAR,
  p_target_ip INET,
  p_target_config JSONB DEFAULT '{}',
  p_priority INTEGER DEFAULT 5
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  task_id UUID;
  agent_id UUID;
  company_id UUID;
BEGIN
  -- Get user's company
  SELECT get_current_user_company_id() INTO company_id;
  
  -- Find an available agent for this company
  SELECT id INTO agent_id 
  FROM public.network_agents 
  WHERE isp_company_id = company_id 
  AND status = 'online' 
  ORDER BY last_heartbeat DESC 
  LIMIT 1;
  
  IF agent_id IS NULL THEN
    RAISE EXCEPTION 'No available network agents found';
  END IF;
  
  -- Create the task
  INSERT INTO public.network_tasks (
    agent_id,
    task_type,
    target_ip,
    target_config,
    priority,
    created_by,
    isp_company_id
  ) VALUES (
    agent_id,
    p_task_type,
    p_target_ip,
    p_target_config,
    p_priority,
    auth.uid(),
    company_id
  ) RETURNING id INTO task_id;
  
  RETURN task_id;
END;
$$;
