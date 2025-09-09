-- Add router assignment and enhance client network management
ALTER TABLE clients ADD COLUMN router_assignment UUID REFERENCES mikrotik_routers(id);

-- Create index for better performance on router assignments
CREATE INDEX idx_clients_router_assignment ON clients(router_assignment);

-- Add comment for clarity
COMMENT ON COLUMN clients.router_assignment IS 'The MikroTik router assigned to this client for network access';

-- Update existing clients to have proper RADIUS sync status
UPDATE clients 
SET radius_sync_status = 'pending' 
WHERE radius_sync_status IS NULL AND status = 'active';

-- Create a view for network management overview
CREATE OR REPLACE VIEW client_network_overview AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.status,
  c.router_assignment,
  c.radius_sync_status,
  c.last_radius_sync_at,
  c.monthly_rate,
  c.wallet_balance,
  c.subscription_end_date,
  mr.name as router_name,
  mr.ip_address as router_ip,
  mr.connection_status as router_status,
  sp.name as service_package_name,
  sp.download_speed,
  sp.upload_speed
FROM clients c
LEFT JOIN mikrotik_routers mr ON c.router_assignment = mr.id
LEFT JOIN service_packages sp ON c.service_package_id = sp.id
WHERE c.isp_company_id = get_current_user_company_id();

-- Grant access to the view
GRANT SELECT ON client_network_overview TO authenticated;

-- Create function to auto-assign clients to routers
CREATE OR REPLACE FUNCTION auto_assign_client_to_router(client_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  router_id UUID;
  company_id UUID;
BEGIN
  -- Get the client's company
  SELECT isp_company_id INTO company_id 
  FROM clients 
  WHERE id = client_id_param;
  
  IF company_id IS NULL THEN
    RAISE EXCEPTION 'Client not found';
  END IF;
  
  -- Find a connected router with the least assigned clients
  SELECT mr.id INTO router_id
  FROM mikrotik_routers mr
  LEFT JOIN clients c ON c.router_assignment = mr.id
  WHERE mr.isp_company_id = company_id 
    AND mr.connection_status = 'connected'
  GROUP BY mr.id
  ORDER BY COUNT(c.id) ASC
  LIMIT 1;
  
  -- If we found a router, assign the client
  IF router_id IS NOT NULL THEN
    UPDATE clients 
    SET router_assignment = router_id,
        radius_sync_status = 'pending',
        last_radius_sync_at = NOW()
    WHERE id = client_id_param;
  END IF;
  
  RETURN router_id;
END;
$$;