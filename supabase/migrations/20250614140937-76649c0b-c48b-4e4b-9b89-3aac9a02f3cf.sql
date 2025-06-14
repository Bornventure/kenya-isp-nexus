
-- Add wallet functionality to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC DEFAULT 0;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS subscription_type VARCHAR(20) DEFAULT 'monthly' CHECK (subscription_type IN ('weekly', 'monthly'));

-- Create wallet transactions table to track all wallet activities
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'payment', 'refund')),
  amount NUMERIC NOT NULL,
  description TEXT,
  reference_number VARCHAR(255),
  mpesa_receipt_number VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  isp_company_id UUID
);

-- Create mpesa settings table for paybill configuration
CREATE TABLE IF NOT EXISTS mpesa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isp_company_id UUID UNIQUE,
  paybill_number VARCHAR(20) NOT NULL,
  passkey TEXT,
  consumer_key TEXT,
  consumer_secret TEXT,
  shortcode VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscription management function
CREATE OR REPLACE FUNCTION process_subscription_renewal(p_client_id UUID)
RETURNS JSONB AS $$
DECLARE
    client_record RECORD;
    package_amount NUMERIC;
    renewal_result JSONB;
BEGIN
    -- Get client and package details
    SELECT c.*, sp.monthly_rate, sp.name as package_name
    INTO client_record
    FROM clients c
    LEFT JOIN service_packages sp ON c.service_package_id = sp.id
    WHERE c.id = p_client_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Client not found');
    END IF;
    
    package_amount := client_record.monthly_rate;
    
    -- Check if wallet has sufficient balance
    IF client_record.wallet_balance >= package_amount THEN
        -- Deduct from wallet and renew subscription
        UPDATE clients 
        SET wallet_balance = wallet_balance - package_amount,
            subscription_start_date = NOW(),
            subscription_end_date = CASE 
                WHEN subscription_type = 'weekly' THEN NOW() + INTERVAL '7 days'
                ELSE NOW() + INTERVAL '30 days'
            END,
            status = 'active'
        WHERE id = p_client_id;
        
        -- Record wallet transaction
        INSERT INTO wallet_transactions (client_id, transaction_type, amount, description, isp_company_id)
        VALUES (p_client_id, 'debit', package_amount, 'Subscription renewal: ' || client_record.package_name, client_record.isp_company_id);
        
        RETURN jsonb_build_object(
            'success', true, 
            'message', 'Subscription renewed successfully',
            'remaining_balance', client_record.wallet_balance - package_amount
        );
    ELSE
        RETURN jsonb_build_object(
            'success', false, 
            'message', 'Insufficient wallet balance',
            'required_amount', package_amount,
            'current_balance', client_record.wallet_balance,
            'shortfall', package_amount - client_record.wallet_balance
        );
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Update renewal reminders function to use wallet system
CREATE OR REPLACE FUNCTION check_wallet_based_renewals()
RETURNS void AS $$
DECLARE
    client_record RECORD;
    days_until_expiry INTEGER;
    required_amount NUMERIC;
    mpesa_paybill VARCHAR(20);
BEGIN
    -- Get paybill number (assuming single ISP for now)
    SELECT paybill_number INTO mpesa_paybill FROM mpesa_settings WHERE is_active = true LIMIT 1;
    
    -- Check all active clients approaching subscription expiry
    FOR client_record IN
        SELECT c.id, c.name, c.email, c.phone, c.wallet_balance, c.subscription_end_date, 
               c.monthly_rate, sp.name as package_name
        FROM clients c
        LEFT JOIN service_packages sp ON c.service_package_id = sp.id
        WHERE c.status = 'active'
        AND c.subscription_end_date IS NOT NULL
        AND c.subscription_end_date <= NOW() + INTERVAL '3 days'
        AND c.subscription_end_date > NOW()
    LOOP
        -- Calculate days until expiry
        days_until_expiry := EXTRACT(DAY FROM (client_record.subscription_end_date - NOW()));
        
        -- Calculate required top-up amount
        required_amount := GREATEST(0, client_record.monthly_rate - client_record.wallet_balance);
        
        -- Send notification based on days remaining and wallet balance
        PERFORM net.http_post(
            url := 'https://ddljuawonxdnesrnclsx.supabase.co/functions/v1/send-notifications',
            headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkbGp1YXdvbnhkbmVzcm5jbHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzOTk0NDksImV4cCI6MjA2NDk3NTQ0OX0.HcMHBQ0dD0rHz2s935PncmiJgaG8C1fJw39XdfGlzeg"}'::jsonb,
            body := jsonb_build_object(
                'client_id', client_record.id,
                'type', 'wallet_reminder',
                'data', jsonb_build_object(
                    'days_until_expiry', days_until_expiry,
                    'current_balance', client_record.wallet_balance,
                    'required_amount', required_amount,
                    'package_amount', client_record.monthly_rate,
                    'package_name', client_record.package_name,
                    'paybill_number', COALESCE(mpesa_paybill, '123456'),
                    'account_number', client_record.phone
                )
            )::jsonb
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to handle automatic subscription renewals
CREATE OR REPLACE FUNCTION handle_automatic_renewals()
RETURNS void AS $$
DECLARE
    client_record RECORD;
BEGIN
    -- Find clients whose subscriptions have expired but have sufficient wallet balance
    FOR client_record IN
        SELECT c.id, c.name, c.wallet_balance, c.monthly_rate
        FROM clients c
        WHERE c.status = 'active'
        AND c.subscription_end_date <= NOW()
        AND c.wallet_balance >= c.monthly_rate
    LOOP
        -- Attempt automatic renewal
        PERFORM process_subscription_renewal(client_record.id);
    END LOOP;
    
    -- Suspend clients whose subscriptions have expired and don't have sufficient balance
    UPDATE clients 
    SET status = 'suspended'
    WHERE subscription_end_date <= NOW()
    AND status = 'active'
    AND wallet_balance < monthly_rate;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on new tables
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mpesa_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for wallet_transactions
CREATE POLICY "Users can view their company's wallet transactions" 
  ON wallet_transactions 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can insert wallet transactions for their company" 
  ON wallet_transactions 
  FOR INSERT 
  WITH CHECK (isp_company_id = get_current_user_company_id());

-- Create RLS policies for mpesa_settings
CREATE POLICY "Users can view their company's mpesa settings" 
  ON mpesa_settings 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can manage their company's mpesa settings" 
  ON mpesa_settings 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());
