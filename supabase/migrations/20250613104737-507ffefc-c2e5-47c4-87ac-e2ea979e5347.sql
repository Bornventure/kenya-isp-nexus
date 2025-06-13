
-- Update a service package for testing (10 KES, 30-minute expiry)
UPDATE service_packages 
SET monthly_rate = 10, 
    name = 'Test Package - 30min', 
    description = 'Testing package with 30-minute expiry and 10 KES rate'
WHERE id = (SELECT id FROM service_packages LIMIT 1);

-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create function to check and send renewal reminders
CREATE OR REPLACE FUNCTION check_renewal_reminders()
RETURNS void AS $$
DECLARE
    client_record RECORD;
    minutes_until_expiry INTEGER;
    notification_type TEXT;
BEGIN
    -- Check all active clients with invoices due within 30 minutes
    FOR client_record IN
        SELECT DISTINCT c.id, c.name, c.email, c.phone, i.due_date, i.total_amount
        FROM clients c
        JOIN invoices i ON c.id = i.client_id
        WHERE c.status = 'active'
        AND i.status = 'pending'
        AND i.due_date > NOW()
        AND i.due_date <= NOW() + INTERVAL '30 minutes'
    LOOP
        -- Calculate minutes until expiry
        minutes_until_expiry := EXTRACT(EPOCH FROM (client_record.due_date - NOW())) / 60;
        
        -- Determine notification type based on time remaining
        IF minutes_until_expiry <= 5 THEN -- Last 5 minutes (representing last day)
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 10 THEN -- 6-10 minutes remaining (representing 2 days)
            notification_type := 'payment_reminder';
        ELSIF minutes_until_expiry <= 15 THEN -- 11-15 minutes remaining (representing 3 days)
            notification_type := 'payment_reminder';
        ELSE
            CONTINUE; -- Skip if not in reminder window
        END IF;
        
        -- Call notification function
        PERFORM net.http_post(
            url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-notifications',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
            body := jsonb_build_object(
                'client_id', client_record.id,
                'type', notification_type,
                'data', jsonb_build_object(
                    'days_until_expiry', CASE 
                        WHEN minutes_until_expiry <= 5 THEN 1
                        WHEN minutes_until_expiry <= 10 THEN 2
                        ELSE 3
                    END,
                    'amount', client_record.total_amount
                )
            )::jsonb
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Schedule the reminder check to run every minute during testing
SELECT cron.schedule(
    'renewal-reminders',
    '* * * * *', -- Every minute
    'SELECT check_renewal_reminders();'
);

-- Create function to handle service expiry
CREATE OR REPLACE FUNCTION handle_service_expiry()
RETURNS void AS $$
DECLARE
    client_record RECORD;
BEGIN
    -- Find clients with expired services
    FOR client_record IN
        SELECT DISTINCT c.id, c.name, c.email
        FROM clients c
        JOIN invoices i ON c.id = i.client_id
        WHERE c.status = 'active'
        AND i.status = 'pending'
        AND i.due_date < NOW()
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

-- Schedule expiry check every minute
SELECT cron.schedule(
    'service-expiry-check',
    '* * * * *', -- Every minute for testing
    'SELECT handle_service_expiry();'
);
