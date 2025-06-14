
-- Fix the suspension timing to be exactly 30 minutes
-- Update the test package to have proper 30-minute expiry
UPDATE service_packages 
SET monthly_rate = 10, 
    name = 'Test Package - 30min', 
    description = 'Testing package with exact 30-minute expiry and 10 KES rate'
WHERE name LIKE '%Test Package%' OR monthly_rate = 10;

-- Update the renewal reminders function to use proper 30-minute intervals
CREATE OR REPLACE FUNCTION check_renewal_reminders()
RETURNS void AS $$
DECLARE
    client_record RECORD;
    minutes_until_expiry INTEGER;
    notification_type TEXT;
BEGIN
    -- Check all active clients with invoices due within exactly 30 minutes
    FOR client_record IN
        SELECT DISTINCT c.id, c.name, c.email, c.phone, i.due_date, i.total_amount
        FROM clients c
        JOIN invoices i ON c.id = i.client_id
        WHERE c.status = 'active'
        AND i.status = 'pending'
        AND i.due_date > NOW()
        AND i.due_date <= NOW() + INTERVAL '30 minutes'
    LOOP
        -- Calculate exact minutes until expiry
        minutes_until_expiry := EXTRACT(EPOCH FROM (client_record.due_date - NOW())) / 60;
        
        -- Send reminders at 25, 20, 15, 10, 5 minutes remaining
        IF minutes_until_expiry <= 5 THEN
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 10 THEN
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 15 THEN
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 20 THEN
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 25 THEN
            notification_type := 'payment_reminder';
        ELSE
            CONTINUE;
        END IF;
        
        -- Call notification function
        PERFORM net.http_post(
            url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-notifications',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
            body := jsonb_build_object(
                'client_id', client_record.id,
                'type', notification_type,
                'data', jsonb_build_object(
                    'minutes_until_expiry', minutes_until_expiry,
                    'amount', client_record.total_amount
                )
            )::jsonb
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Update service expiry to check for exactly expired services (past due date)
CREATE OR REPLACE FUNCTION handle_service_expiry()
RETURNS void AS $$
DECLARE
    client_record RECORD;
BEGIN
    -- Find clients with expired services (past due date)
    FOR client_record IN
        SELECT DISTINCT c.id, c.name, c.email
        FROM clients c
        JOIN invoices i ON c.id = i.client_id
        WHERE c.status = 'active'
        AND i.status = 'pending'
        AND i.due_date <= NOW() -- Changed from < to <= to include exactly expired
    LOOP
        -- Suspend the client
        UPDATE clients 
        SET status = 'suspended' 
        WHERE id = client_record.id;
        
        -- Send expiry notification
        PERFORM net.http_post(
            url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-notifications',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
            body := jsonb_build_object(
                'client_id', client_record.id,
                'type', 'service_expiry'
            )::jsonb
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
