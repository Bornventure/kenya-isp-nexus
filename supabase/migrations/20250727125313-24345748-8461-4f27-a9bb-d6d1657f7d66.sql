
-- Add installation_fee to system_settings table
ALTER TABLE system_settings ADD COLUMN installation_fee NUMERIC DEFAULT 0;

-- Update clients table to support the new workflow
ALTER TABLE clients ADD COLUMN submitted_by UUID REFERENCES profiles(id);
ALTER TABLE clients ADD COLUMN approved_by UUID REFERENCES profiles(id);
ALTER TABLE clients ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN installation_status TEXT DEFAULT 'pending';
ALTER TABLE clients ADD COLUMN installation_completed_by UUID REFERENCES profiles(id);
ALTER TABLE clients ADD COLUMN installation_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE clients ADD COLUMN service_activated_at TIMESTAMP WITH TIME ZONE;

-- Create installation_invoices table
CREATE TABLE installation_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID NOT NULL REFERENCES isp_companies(id),
  equipment_details JSONB,
  notes TEXT
);

-- Create equipment_assignments table for tracking equipment assignments
CREATE TABLE equipment_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  installation_notes TEXT,
  isp_company_id UUID NOT NULL REFERENCES isp_companies(id),
  UNIQUE(client_id, equipment_id)
);

-- Create technical_installations table for installation workflow
CREATE TABLE technical_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  assigned_technician UUID REFERENCES profiles(id),
  installation_date DATE,
  status TEXT DEFAULT 'pending',
  completion_notes TEXT,
  completed_by UUID REFERENCES profiles(id),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isp_company_id UUID NOT NULL REFERENCES isp_companies(id)
);

-- Add RLS policies for new tables
ALTER TABLE installation_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_installations ENABLE ROW LEVEL SECURITY;

-- RLS policies for installation_invoices
CREATE POLICY "Company users can manage installation invoices" ON installation_invoices
FOR ALL USING (isp_company_id = get_current_user_company_id());

-- RLS policies for equipment_assignments
CREATE POLICY "Company users can manage equipment assignments" ON equipment_assignments
FOR ALL USING (isp_company_id = get_current_user_company_id());

-- RLS policies for technical_installations
CREATE POLICY "Company users can manage technical installations" ON technical_installations
FOR ALL USING (isp_company_id = get_current_user_company_id());

-- Function to generate installation invoice number
CREATE OR REPLACE FUNCTION generate_installation_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(installation_invoices.invoice_number FROM 'INST-([0-9]+)') AS INTEGER)), 0) + 1
    INTO next_number
    FROM installation_invoices;
    
    invoice_number := 'INST-' || LPAD(next_number::TEXT, 6, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate service package invoice after installation
CREATE OR REPLACE FUNCTION generate_service_package_invoice(client_id_param UUID)
RETURNS UUID AS $$
DECLARE
    client_record RECORD;
    package_record RECORD;
    invoice_id UUID;
    invoice_number TEXT;
    vat_amount NUMERIC;
    total_amount NUMERIC;
BEGIN
    -- Get client details
    SELECT * INTO client_record FROM clients WHERE id = client_id_param;
    
    -- Get service package details
    SELECT * INTO package_record FROM service_packages WHERE id = client_record.service_package_id;
    
    -- Calculate amounts
    vat_amount := client_record.monthly_rate * 0.16;
    total_amount := client_record.monthly_rate + vat_amount;
    
    -- Generate invoice number
    SELECT 'PKG-' || LPAD((COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 'PKG-([0-9]+)') AS INTEGER)), 0) + 1)::TEXT, 6, '0')
    INTO invoice_number
    FROM invoices
    WHERE invoice_number LIKE 'PKG-%';
    
    -- Create service package invoice
    INSERT INTO invoices (
        invoice_number,
        client_id,
        amount,
        vat_amount,
        total_amount,
        status,
        due_date,
        service_period_start,
        service_period_end,
        notes,
        isp_company_id
    ) VALUES (
        invoice_number,
        client_id_param,
        client_record.monthly_rate,
        vat_amount,
        total_amount,
        'pending',
        CURRENT_DATE + INTERVAL '7 days',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '1 month',
        'Initial service package invoice for ' || package_record.name,
        client_record.isp_company_id
    ) RETURNING id INTO invoice_id;
    
    RETURN invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate service invoice when installation is completed
CREATE OR REPLACE FUNCTION handle_installation_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.installation_status = 'pending' AND NEW.installation_status = 'completed' THEN
        -- Generate service package invoice
        PERFORM generate_service_package_invoice(NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER installation_completion_trigger
    AFTER UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION handle_installation_completion();
