
-- First, let's check if the clients table has a notes column and add it if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='notes') THEN
        ALTER TABLE clients ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Check if the status enum includes 'rejected' and add it if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'rejected' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'client_status')
    ) THEN
        ALTER TYPE client_status ADD VALUE 'rejected';
    END IF;
END $$;

-- Ensure all other fields exist that the code expects
DO $$ 
BEGIN
    -- Add rejection_reason if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='rejection_reason') THEN
        ALTER TABLE clients ADD COLUMN rejection_reason TEXT;
    END IF;
    
    -- Add rejected_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='rejected_at') THEN
        ALTER TABLE clients ADD COLUMN rejected_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add rejected_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='rejected_by') THEN
        ALTER TABLE clients ADD COLUMN rejected_by TEXT;
    END IF;
    
    -- Add installation_status if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='installation_status') THEN
        ALTER TABLE clients ADD COLUMN installation_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add submitted_by if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='submitted_by') THEN
        ALTER TABLE clients ADD COLUMN submitted_by TEXT;
    END IF;
    
    -- Add service_activated_at if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='service_activated_at') THEN
        ALTER TABLE clients ADD COLUMN service_activated_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add latitude if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='latitude') THEN
        ALTER TABLE clients ADD COLUMN latitude DECIMAL;
    END IF;
    
    -- Add longitude if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='longitude') THEN
        ALTER TABLE clients ADD COLUMN longitude DECIMAL;
    END IF;
END $$;
