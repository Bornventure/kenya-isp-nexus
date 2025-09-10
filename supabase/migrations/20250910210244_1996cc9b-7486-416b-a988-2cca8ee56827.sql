-- Enable RLS and add policies to the new tables
ALTER TABLE radius_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE radius_sessions ENABLE ROW LEVEL SECURITY;

-- Create simple RLS policies
CREATE POLICY "Users can manage radius events in their company" 
ON radius_events FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() 
  AND p.isp_company_id = radius_events.isp_company_id
));

CREATE POLICY "Users can manage radius sessions in their company" 
ON radius_sessions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.id = auth.uid() 
  AND p.isp_company_id = radius_sessions.isp_company_id
));