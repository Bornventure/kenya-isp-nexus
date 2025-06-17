
-- Create external_users table for managing external technicians and contractors
CREATE TABLE public.external_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR,
  role VARCHAR NOT NULL CHECK (role IN ('external_technician', 'external_contractor')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  company_name VARCHAR,
  specializations TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Add RLS policies for external_users
ALTER TABLE public.external_users ENABLE ROW LEVEL SECURITY;

-- Policy to allow ISP company users to manage their external users
CREATE POLICY "ISP company users can manage external users" 
  ON public.external_users 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Create indexes for better performance
CREATE INDEX idx_external_users_company ON public.external_users(isp_company_id);
CREATE INDEX idx_external_users_role ON public.external_users(role);
CREATE INDEX idx_external_users_active ON public.external_users(is_active);

-- Create notification_logs table for tracking notifications
CREATE TABLE public.notification_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES public.support_tickets(id),
  type VARCHAR NOT NULL,
  channels TEXT[] NOT NULL,
  recipients TEXT[] NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Add RLS for notification_logs
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ISP company users can manage notification logs" 
  ON public.notification_logs 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());
