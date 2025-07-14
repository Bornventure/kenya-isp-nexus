
-- First, let's check if there are any conflicting policies and clean them up
DROP POLICY IF EXISTS "Public can submit registration requests" ON public.company_registration_requests;
DROP POLICY IF EXISTS "Anyone can submit registration requests" ON public.company_registration_requests;

-- Create a single, clear policy for public registration submissions
CREATE POLICY "Allow public registration submissions" 
  ON public.company_registration_requests 
  FOR INSERT 
  TO public, anon, authenticated
  WITH CHECK (true);

-- Ensure the super admin policy exists for management
CREATE POLICY "Super admin manages all registration requests" 
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

-- Also grant usage on the sequence if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name LIKE '%company_registration_requests%') THEN
    GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
  END IF;
END $$;
