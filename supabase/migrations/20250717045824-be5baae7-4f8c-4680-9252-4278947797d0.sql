
-- Create ENUMs for status tracking
CREATE TYPE stk_status AS ENUM ('pending', 'success', 'failed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('received', 'verified', 'reversed');

-- Create Family Bank STK requests table
CREATE TABLE public.family_bank_stk_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  account_reference VARCHAR(32) NOT NULL,
  transaction_desc VARCHAR(64),
  third_party_trans_id VARCHAR(64) UNIQUE NOT NULL,
  merchant_request_id VARCHAR(128),
  checkout_request_id VARCHAR(128),
  status_code VARCHAR(10),
  response_description TEXT,
  customer_message TEXT,
  status stk_status DEFAULT 'pending',
  callback_raw JSONB,
  client_id UUID,
  invoice_id UUID,
  isp_company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create Family Bank payments table (for C2B Paybill)
CREATE TABLE public.family_bank_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trans_id VARCHAR(64) UNIQUE NOT NULL,
  trans_time VARCHAR(32),
  transaction_type VARCHAR(32),
  trans_amount NUMERIC(10, 2) NOT NULL,
  business_shortcode VARCHAR(16),
  bill_ref_number VARCHAR(32),
  invoice_number VARCHAR(32),
  org_account_balance NUMERIC(12, 2),
  third_party_trans_id VARCHAR(64),
  msisdn VARCHAR(20),
  kyc_info VARCHAR(128),
  first_name VARCHAR(64),
  middle_name VARCHAR(64),
  last_name VARCHAR(64),
  status payment_status DEFAULT 'received',
  callback_raw JSONB,
  client_id UUID,
  isp_company_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create STK callbacks table for logging
CREATE TABLE public.family_bank_stk_callbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  callback_raw JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_family_bank_stk_third_party_trans_id ON family_bank_stk_requests (third_party_trans_id);
CREATE INDEX idx_family_bank_payments_trans_id ON family_bank_payments (trans_id);
CREATE INDEX idx_family_bank_stk_client_id ON family_bank_stk_requests (client_id);
CREATE INDEX idx_family_bank_payments_client_id ON family_bank_payments (client_id);

-- Create trigger function to update STK status from callbacks
CREATE OR REPLACE FUNCTION update_family_bank_stk_status_from_callback()
RETURNS TRIGGER AS $$
DECLARE
  response_code TEXT;
  third_party_id TEXT;
BEGIN
  response_code := NEW.callback_raw->>'ResponseCode';
  third_party_id := NEW.callback_raw->>'ThirdPartyTransID';

  IF response_code = '0' THEN
    UPDATE family_bank_stk_requests
    SET status = 'success',
        merchant_request_id = NEW.callback_raw->>'MerchantRequestID',
        checkout_request_id = NEW.callback_raw->>'CheckoutRequestID',
        callback_raw = NEW.callback_raw
    WHERE third_party_trans_id = third_party_id;
  ELSE
    UPDATE family_bank_stk_requests
    SET status = 'failed',
        response_description = NEW.callback_raw->>'ResponseDescription',
        callback_raw = NEW.callback_raw
    WHERE third_party_trans_id = third_party_id;
  END IF;

  -- Mark callback as processed
  UPDATE family_bank_stk_callbacks
  SET processed = true
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to auto-verify Family Bank payments
CREATE OR REPLACE FUNCTION update_family_bank_payment_status_on_ipn()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-verify payment upon insertion
  NEW.status := 'verified';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trg_update_family_bank_stk_status
  AFTER INSERT ON family_bank_stk_callbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_family_bank_stk_status_from_callback();

CREATE TRIGGER trg_auto_verify_family_bank_payment
  BEFORE INSERT ON family_bank_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_family_bank_payment_status_on_ipn();

-- Enable RLS
ALTER TABLE family_bank_stk_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_bank_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_bank_stk_callbacks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Company users can manage their Family Bank STK requests" 
  ON family_bank_stk_requests 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Company users can manage their Family Bank payments" 
  ON family_bank_payments 
  FOR ALL 
  USING (isp_company_id = get_current_user_company_id());

-- Service role policies for edge functions
CREATE POLICY "Service role can manage Family Bank STK requests" 
  ON family_bank_stk_requests 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage Family Bank payments" 
  ON family_bank_payments 
  FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage Family Bank STK callbacks" 
  ON family_bank_stk_callbacks 
  FOR ALL 
  USING (auth.role() = 'service_role');
