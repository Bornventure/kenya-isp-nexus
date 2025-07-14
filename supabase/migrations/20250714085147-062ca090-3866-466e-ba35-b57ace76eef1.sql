
-- Update the INSERT policy to allow both authenticated and unauthenticated users
DROP POLICY IF EXISTS "Public can submit registration requests" ON public.company_registration_requests;

-- Create a policy that allows anyone (authenticated or not) to submit registration requests
CREATE POLICY "Anyone can submit registration requests" 
  ON public.company_registration_requests 
  FOR INSERT 
  WITH CHECK (true);
