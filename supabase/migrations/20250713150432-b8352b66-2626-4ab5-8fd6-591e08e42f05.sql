
-- Create license types table for dynamic pricing management
CREATE TABLE public.license_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  client_limit INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default license types
INSERT INTO public.license_types (name, display_name, client_limit, price, description, sort_order) VALUES
('starter', 'Starter', 50, 15000.00, 'Perfect for small ISPs starting out', 1),
('professional', 'Professional', 200, 35000.00, 'Ideal for growing ISP businesses', 2),
('enterprise', 'Enterprise', 1000, 75000.00, 'Complete solution for large ISPs', 3);

-- Add Row Level Security
ALTER TABLE public.license_types ENABLE ROW LEVEL SECURITY;

-- Super admin can manage license types
CREATE POLICY "Super admin can manage license types" 
  ON public.license_types 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Anyone can view active license types (for the registration form)
CREATE POLICY "Anyone can view active license types" 
  ON public.license_types 
  FOR SELECT 
  USING (is_active = true);
