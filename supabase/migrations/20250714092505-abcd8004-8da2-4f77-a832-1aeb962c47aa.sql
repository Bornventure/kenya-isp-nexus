
-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.company_registration_requests;

-- Create a new policy that properly targets both anon and authenticated roles
CREATE POLICY "Anyone can submit registration requests" 
  ON public.company_registration_requests 
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);
