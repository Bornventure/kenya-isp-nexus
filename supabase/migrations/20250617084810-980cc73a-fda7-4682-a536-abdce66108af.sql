
-- Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  isp_company_id UUID REFERENCES public.isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create ticket assignments table to track routing history
CREATE TABLE public.ticket_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  assigned_from UUID REFERENCES public.profiles(id),
  assigned_to UUID REFERENCES public.profiles(id),
  department_id UUID REFERENCES public.departments(id),
  assignment_reason TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  notes TEXT,
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Create ticket comments table for internal communication
CREATE TABLE public.ticket_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  is_resolution BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id)
);

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  sms_notifications BOOLEAN NOT NULL DEFAULT false,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT false,
  notification_types JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to support_tickets table (skip assigned_to since it already exists)
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id),
ADD COLUMN IF NOT EXISTS escalation_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS sla_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS external_reference VARCHAR(100),
ADD COLUMN IF NOT EXISTS ticket_source VARCHAR(50) DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS location_info JSONB,
ADD COLUMN IF NOT EXISTS requires_field_visit BOOLEAN DEFAULT false;

-- Create ticket types enum
CREATE TYPE public.ticket_type AS ENUM (
  'technical', 'billing', 'general', 'installation', 'maintenance', 'complaint'
);

-- Add ticket type to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS ticket_type ticket_type DEFAULT 'general';

-- Enable RLS on new tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for departments
CREATE POLICY "Company departments access" ON public.departments
  FOR ALL USING (
    isp_company_id = get_current_user_company_id() OR 
    get_current_user_role() = 'super_admin'
  );

-- Create RLS policies for ticket assignments
CREATE POLICY "Company ticket assignments access" ON public.ticket_assignments
  FOR ALL USING (
    isp_company_id = get_current_user_company_id() OR 
    get_current_user_role() = 'super_admin'
  );

-- Create RLS policies for ticket comments
CREATE POLICY "Company ticket comments access" ON public.ticket_comments
  FOR ALL USING (
    isp_company_id = get_current_user_company_id() OR 
    get_current_user_role() = 'super_admin'
  );

-- Create RLS policies for notification preferences
CREATE POLICY "Users can manage their notification preferences" ON public.notification_preferences
  FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_ticket_assignments_ticket_id ON public.ticket_assignments(ticket_id);
CREATE INDEX idx_ticket_assignments_assigned_to ON public.ticket_assignments(assigned_to);
CREATE INDEX idx_ticket_comments_ticket_id ON public.ticket_comments(ticket_id);
CREATE INDEX idx_support_tickets_department_id ON public.support_tickets(department_id);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);

-- Insert default departments
INSERT INTO public.departments (name, description, isp_company_id) 
SELECT 'Customer Service', 'General customer inquiries and support', id FROM public.isp_companies;

INSERT INTO public.departments (name, description, isp_company_id) 
SELECT 'Technical Support', 'Technical issues and troubleshooting', id FROM public.isp_companies;

INSERT INTO public.departments (name, description, isp_company_id) 
SELECT 'Finance', 'Billing and payment related issues', id FROM public.isp_companies;

INSERT INTO public.departments (name, description, isp_company_id) 
SELECT 'Field Operations', 'Installation and maintenance services', id FROM public.isp_companies;
