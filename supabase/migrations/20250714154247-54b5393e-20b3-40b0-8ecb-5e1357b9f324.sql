
-- Fix the generate_invoice_number function to avoid ambiguous column reference
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(super_admin_invoices.invoice_number FROM 'INV-([0-9]+)') AS INTEGER)), 0) + 1
  INTO next_number
  FROM super_admin_invoices;
  
  invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_number;
END;
$$;
