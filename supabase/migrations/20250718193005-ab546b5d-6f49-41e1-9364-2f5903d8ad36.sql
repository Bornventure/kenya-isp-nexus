
-- Fix RLS policies for notification_preferences table
DROP POLICY IF EXISTS "Users can manage their notification preferences" ON notification_preferences;
CREATE POLICY "Users can manage their notification preferences" 
ON notification_preferences 
FOR ALL 
TO authenticated 
USING (user_id = auth.uid()) 
WITH CHECK (user_id = auth.uid());

-- Fix RLS policies for mpesa_settings table  
DROP POLICY IF EXISTS "Users can manage their company's mpesa settings" ON mpesa_settings;
DROP POLICY IF EXISTS "Users can view their company's mpesa settings" ON mpesa_settings;

CREATE POLICY "Company users can manage mpesa settings" 
ON mpesa_settings 
FOR ALL 
TO authenticated 
USING (isp_company_id = get_current_user_company_id()) 
WITH CHECK (isp_company_id = get_current_user_company_id());

-- Fix RLS policies for payment_method_settings table
DROP POLICY IF EXISTS "Company users can manage their payment method settings" ON payment_method_settings;

CREATE POLICY "Company users can manage payment method settings" 
ON payment_method_settings 
FOR ALL 
TO authenticated 
USING (isp_company_id = get_current_user_company_id()) 
WITH CHECK (isp_company_id = get_current_user_company_id());
