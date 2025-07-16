
-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  isp_company_id UUID NOT NULL REFERENCES public.isp_companies(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  timezone VARCHAR(100) DEFAULT 'Africa/Nairobi',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  currency VARCHAR(10) DEFAULT 'KES',
  backup_enabled BOOLEAN DEFAULT true,
  backup_frequency VARCHAR(20) DEFAULT 'daily',
  maintenance_mode BOOLEAN DEFAULT false,
  smtp_host VARCHAR(255),
  smtp_port VARCHAR(10) DEFAULT '587',
  smtp_username VARCHAR(255),
  email_from_address VARCHAR(255),
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(isp_company_id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their company's system settings" 
  ON public.system_settings 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());
