
-- Create RADIUS NAS clients table
CREATE TABLE public.radius_nas_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nas_name VARCHAR(255) NOT NULL,
  nas_ip INET NOT NULL,
  nas_secret VARCHAR(255) NOT NULL,
  nas_type VARCHAR(50) NOT NULL DEFAULT 'mikrotik',
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen TIMESTAMP WITH TIME ZONE,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.radius_nas_clients ENABLE ROW LEVEL SECURITY;

-- Policy for company users to manage their NAS clients
CREATE POLICY "Company users can manage their NAS clients" 
ON public.radius_nas_clients 
FOR ALL 
USING (isp_company_id = get_current_user_company_id());
