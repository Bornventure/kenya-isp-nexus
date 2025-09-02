-- Create a function to call the radius-webhook edge function
CREATE OR REPLACE FUNCTION call_radius_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the radius-webhook edge function with the record data and table name
  PERFORM net.http_post(
    url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
    body := jsonb_build_object(
      'record', to_jsonb(NEW),
      'table_name', TG_TABLE_NAME
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for mikrotik_routers table
DROP TRIGGER IF EXISTS call_radius_webhook_mikrotik_trigger ON mikrotik_routers;
CREATE TRIGGER call_radius_webhook_mikrotik_trigger
AFTER INSERT OR UPDATE ON mikrotik_routers
FOR EACH ROW
EXECUTE FUNCTION call_radius_webhook();

-- Create trigger for clients table
DROP TRIGGER IF EXISTS call_radius_webhook_clients_trigger ON clients;
CREATE TRIGGER call_radius_webhook_clients_trigger
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION call_radius_webhook();