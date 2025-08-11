
-- Create mikrotik_routers table
CREATE TABLE IF NOT EXISTS public.mikrotik_routers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  ip_address INET NOT NULL,
  admin_username TEXT DEFAULT 'admin',
  admin_password TEXT NOT NULL,
  snmp_community TEXT DEFAULT 'public',
  snmp_version INTEGER DEFAULT 2,
  pppoe_interface TEXT DEFAULT 'pppoe-server1',
  dns_servers TEXT DEFAULT '8.8.8.8,8.8.4.4',
  client_network TEXT DEFAULT '10.0.0.0/24',
  gateway TEXT,
  status TEXT DEFAULT 'pending',
  last_test_results JSONB,
  connection_status TEXT DEFAULT 'offline',
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mikrotik_routers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their company MikroTik routers" 
  ON public.mikrotik_routers 
  FOR ALL
  USING (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Update the promote_inventory_to_equipment function to work with the existing equipment table
CREATE OR REPLACE FUNCTION public.promote_inventory_to_equipment(
  inventory_item_id UUID,
  equipment_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  equipment_id UUID;
  company_id UUID;
  item_name TEXT;
  item_type TEXT;
  item_brand TEXT;
  item_model TEXT;
  item_serial TEXT;
  item_mac TEXT;
BEGIN
  -- Get the inventory item details
  SELECT 
    isp_company_id, 
    COALESCE(name, type),
    type,
    manufacturer,
    model,
    serial_number,
    mac_address
  INTO 
    company_id, 
    item_name,
    item_type,
    item_brand,
    item_model,
    item_serial,
    item_mac
  FROM public.inventory_items 
  WHERE id = inventory_item_id;
  
  IF company_id IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found or access denied';
  END IF;
  
  -- Create the equipment record
  INSERT INTO public.equipment (
    type,
    brand,
    model,
    serial_number,
    mac_address,
    equipment_type_id,
    ip_address,
    snmp_community,
    snmp_version,
    status,
    notes,
    approval_status,
    isp_company_id
  ) VALUES (
    item_type,
    item_brand,
    item_model,
    item_serial,
    item_mac,
    (equipment_data->>'equipment_type_id')::UUID,
    (equipment_data->>'ip_address')::INET,
    COALESCE(equipment_data->>'snmp_community', 'public'),
    COALESCE((equipment_data->>'snmp_version')::INTEGER, 2),
    'available',
    equipment_data->>'notes',
    'approved',
    company_id
  )
  RETURNING id INTO equipment_id;
  
  -- Update the inventory item
  UPDATE public.inventory_items 
  SET 
    is_network_equipment = true,
    equipment_id = equipment_id,
    status = 'Deployed',
    notes = COALESCE(notes, '') || ' - Promoted to Network Equipment',
    updated_at = now()
  WHERE id = inventory_item_id;
  
  RETURN equipment_id;
END;
$$;
