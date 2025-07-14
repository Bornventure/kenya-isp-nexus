
-- Update RLS policy for isp_companies to allow super_admin to insert new companies
DROP POLICY IF EXISTS "ISP company access" ON isp_companies;

-- Create separate policies for different operations
CREATE POLICY "Users can view their own company or super_admin can view all" 
ON isp_companies FOR SELECT 
USING (
  (id = (SELECT profiles.isp_company_id FROM profiles WHERE profiles.id = auth.uid())) 
  OR 
  ((SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'super_admin'::user_role)
);

CREATE POLICY "Super admin can insert new companies" 
ON isp_companies FOR INSERT 
WITH CHECK (
  (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'super_admin'::user_role
);

CREATE POLICY "Super admin can update companies" 
ON isp_companies FOR UPDATE 
USING (
  (SELECT profiles.role FROM profiles WHERE profiles.id = auth.uid()) = 'super_admin'::user_role
);
