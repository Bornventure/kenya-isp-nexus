
-- First, let's clean up all existing policies on the table
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.company_registration_requests;
DROP POLICY IF EXISTS "Super admin can manage registration requests" ON public.company_registration_requests;
DROP POLICY IF EXISTS "Super admin can view and manage registration requests" ON public.company_registration_requests;
DROP POLICY IF EXISTS "Super admin can update registration requests" ON public.company_registration_requests;

-- Create a simple policy that allows anyone to insert registration requests
CREATE POLICY "Public can submit registration requests" 
  ON public.company_registration_requests 
  FOR INSERT 
  TO public
  WITH CHECK (true);

-- Create a policy for super admins to manage all registration requests
CREATE POLICY "Super admin full access to registration requests" 
  ON public.company_registration_requests 
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
