-- Drop existing triggers to recreate them with optimizations
DROP TRIGGER IF EXISTS call_radius_webhook_mikrotik_trigger ON mikrotik_routers;
DROP TRIGGER IF EXISTS call_radius_webhook_clients_trigger ON clients;

-- Create optimized trigger function that only fires on relevant changes
CREATE OR REPLACE FUNCTION public.call_radius_webhook()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  should_fire_webhook BOOLEAN := FALSE;
BEGIN
  -- For MikroTik routers, only fire on specific field changes
  IF TG_TABLE_NAME = 'mikrotik_routers' THEN
    IF TG_OP = 'INSERT' THEN
      should_fire_webhook := TRUE;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Only fire if RADIUS-related fields changed
      IF (OLD.connection_status IS DISTINCT FROM NEW.connection_status) OR
         (OLD.radius_secret IS DISTINCT FROM NEW.radius_secret) OR
         (OLD.coa_secret IS DISTINCT FROM NEW.coa_secret) OR
         (OLD.ip_address IS DISTINCT FROM NEW.ip_address) OR
         (OLD.status IS DISTINCT FROM NEW.status) THEN
        should_fire_webhook := TRUE;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      should_fire_webhook := TRUE;
    END IF;
  END IF;

  -- For clients, only fire on specific field changes that affect RADIUS
  IF TG_TABLE_NAME = 'clients' THEN
    IF TG_OP = 'INSERT' THEN
      -- Only fire if client has RADIUS credentials
      IF NEW.router_assignment IS NOT NULL THEN
        should_fire_webhook := TRUE;
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      -- Only fire if RADIUS-related fields changed
      IF (OLD.status IS DISTINCT FROM NEW.status) OR
         (OLD.router_assignment IS DISTINCT FROM NEW.router_assignment) OR
         (OLD.service_package_id IS DISTINCT FROM NEW.service_package_id) OR
         (OLD.radius_sync_status IS DISTINCT FROM NEW.radius_sync_status AND NEW.radius_sync_status = 'pending') THEN
        should_fire_webhook := TRUE;
      END IF;
    ELSIF TG_OP = 'DELETE' THEN
      -- Only fire if client had RADIUS assignment
      IF OLD.router_assignment IS NOT NULL THEN
        should_fire_webhook := TRUE;
      END IF;
    END IF;
  END IF;

  -- Only call webhook if we determined it should fire
  IF should_fire_webhook THEN
    -- Use a shorter timeout and don't wait for response to avoid blocking
    PERFORM net.http_post(
      url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/radius-webhook',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg", "X-No-Wait": "true"}'::jsonb,
      body := jsonb_build_object(
        'record', CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
        'table_name', TG_TABLE_NAME,
        'action', TG_OP
      ),
      timeout_milliseconds := 5000
    );
  END IF;

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

-- Create optimized triggers
CREATE TRIGGER call_radius_webhook_mikrotik_trigger
  AFTER INSERT OR UPDATE OR DELETE ON mikrotik_routers
  FOR EACH ROW
  EXECUTE FUNCTION public.call_radius_webhook();

CREATE TRIGGER call_radius_webhook_clients_trigger
  AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION public.call_radius_webhook();