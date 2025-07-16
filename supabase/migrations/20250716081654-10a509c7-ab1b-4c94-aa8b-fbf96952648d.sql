
-- Create function to get system settings
CREATE OR REPLACE FUNCTION public.get_system_settings(company_id UUID)
RETURNS TABLE (
  company_name VARCHAR(255),
  timezone VARCHAR(100),
  date_format VARCHAR(20),
  currency VARCHAR(10),
  backup_enabled BOOLEAN,
  backup_frequency VARCHAR(20),
  maintenance_mode BOOLEAN,
  smtp_host VARCHAR(255),
  smtp_port VARCHAR(10),
  smtp_username VARCHAR(255),
  email_from_address VARCHAR(255),
  notifications_enabled BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ss.company_name,
    ss.timezone,
    ss.date_format,
    ss.currency,
    ss.backup_enabled,
    ss.backup_frequency,
    ss.maintenance_mode,
    ss.smtp_host,
    ss.smtp_port,
    ss.smtp_username,
    ss.email_from_address,
    ss.notifications_enabled
  FROM public.system_settings ss
  WHERE ss.isp_company_id = company_id;
END;
$$;

-- Create function to upsert system settings
CREATE OR REPLACE FUNCTION public.upsert_system_settings(
  company_id UUID,
  settings_data JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.system_settings (
    isp_company_id,
    company_name,
    timezone,
    date_format,
    currency,
    backup_enabled,
    backup_frequency,
    maintenance_mode,
    smtp_host,
    smtp_port,
    smtp_username,
    email_from_address,
    notifications_enabled,
    updated_at
  ) VALUES (
    company_id,
    (settings_data->>'company_name')::VARCHAR(255),
    (settings_data->>'timezone')::VARCHAR(100),
    (settings_data->>'date_format')::VARCHAR(20),
    (settings_data->>'currency')::VARCHAR(10),
    (settings_data->>'backup_enabled')::BOOLEAN,
    (settings_data->>'backup_frequency')::VARCHAR(20),
    (settings_data->>'maintenance_mode')::BOOLEAN,
    (settings_data->>'smtp_host')::VARCHAR(255),
    (settings_data->>'smtp_port')::VARCHAR(10),
    (settings_data->>'smtp_username')::VARCHAR(255),
    (settings_data->>'email_from_address')::VARCHAR(255),
    (settings_data->>'notifications_enabled')::BOOLEAN,
    NOW()
  )
  ON CONFLICT (isp_company_id)
  DO UPDATE SET
    company_name = EXCLUDED.company_name,
    timezone = EXCLUDED.timezone,
    date_format = EXCLUDED.date_format,
    currency = EXCLUDED.currency,
    backup_enabled = EXCLUDED.backup_enabled,
    backup_frequency = EXCLUDED.backup_frequency,
    maintenance_mode = EXCLUDED.maintenance_mode,
    smtp_host = EXCLUDED.smtp_host,
    smtp_port = EXCLUDED.smtp_port,
    smtp_username = EXCLUDED.smtp_username,
    email_from_address = EXCLUDED.email_from_address,
    notifications_enabled = EXCLUDED.notifications_enabled,
    updated_at = NOW();
END;
$$;
