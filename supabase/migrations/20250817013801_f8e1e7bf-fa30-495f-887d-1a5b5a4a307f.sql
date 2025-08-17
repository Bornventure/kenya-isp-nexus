
-- Create client_workflow_status table for tracking client approval workflow
CREATE TABLE IF NOT EXISTS public.client_workflow_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  current_stage VARCHAR(50) NOT NULL DEFAULT 'pending',
  stage_data JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES auth.users(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID NOT NULL REFERENCES public.isp_companies(id) ON DELETE CASCADE
);

-- Create client_equipment_assignments table for tracking equipment assignments
CREATE TABLE IF NOT EXISTS public.client_equipment_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  installation_notes TEXT,
  status VARCHAR(20) DEFAULT 'assigned',
  isp_company_id UUID NOT NULL REFERENCES public.isp_companies(id) ON DELETE CASCADE
);

-- Add RLS policies for client_workflow_status
ALTER TABLE public.client_workflow_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workflow status for their company" 
  ON public.client_workflow_status 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can insert workflow status for their company" 
  ON public.client_workflow_status 
  FOR INSERT 
  WITH CHECK (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can update workflow status for their company" 
  ON public.client_workflow_status 
  FOR UPDATE 
  USING (isp_company_id = get_current_user_company_id());

-- Add RLS policies for client_equipment_assignments
ALTER TABLE public.client_equipment_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view equipment assignments for their company" 
  ON public.client_equipment_assignments 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can insert equipment assignments for their company" 
  ON public.client_equipment_assignments 
  FOR INSERT 
  WITH CHECK (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can update equipment assignments for their company" 
  ON public.client_equipment_assignments 
  FOR UPDATE 
  USING (isp_company_id = get_current_user_company_id());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_workflow_status_client_id ON public.client_workflow_status(client_id);
CREATE INDEX IF NOT EXISTS idx_client_workflow_status_company_id ON public.client_workflow_status(isp_company_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_assignments_client_id ON public.client_equipment_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_equipment_assignments_equipment_id ON public.client_equipment_assignments(equipment_id);
