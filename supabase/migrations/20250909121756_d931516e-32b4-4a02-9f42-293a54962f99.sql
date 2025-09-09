-- Fix the security issue with the auto_assign function by setting search_path
DROP FUNCTION IF EXISTS auto_assign_client_to_router(UUID);

CREATE OR REPLACE FUNCTION auto_assign_client_to_router(client_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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