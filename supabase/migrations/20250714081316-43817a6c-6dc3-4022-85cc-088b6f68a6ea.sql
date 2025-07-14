
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Super admin can manage registration requests" ON public.company_registration_requests;

-- Create new policies that allow public registration but restrict management to super admins
CREATE POLICY "Anyone can submit registration requests" 
  ON public.company_registration_requests 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Super admin can view and manage registration requests" 
  ON public.company_registration_requests 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update registration requests" 
  ON public.company_registration_requests 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
