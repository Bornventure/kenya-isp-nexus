-- Create a function to process existing clients and routers
CREATE OR REPLACE FUNCTION process_existing_radius_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  router_record RECORD;
  client_record RECORD;
BEGIN
  -- Process existing mikrotik_routers
  FOR router_record IN 
    SELECT * FROM mikrotik_routers
  LOOP
    PERFORM net.http_post(
      url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
      body := jsonb_build_object(
        'record', to_jsonb(router_record),
        'table_name', 'mikrotik_routers'
      )
    );
  END LOOP;

  -- Process existing clients
  FOR client_record IN 
    SELECT * FROM clients
  LOOP
    PERFORM net.http_post(
      url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
      body := jsonb_build_object(
        'record', to_jsonb(client_record),
        'table_name', 'clients'
      )
    );
  END LOOP;
END;
$$;

-- Execute the function to process existing records
SELECT process_existing_radius_records();

-- Drop the function as it's only needed once
DROP FUNCTION process_existing_radius_records();