
-- Create equipment_types table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.equipment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category TEXT DEFAULT 'Network Hardware',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE
);

-- Create network_equipment table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.network_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  equipment_type_id UUID REFERENCES public.equipment_types(id) ON DELETE SET NULL,
  inventory_item_id UUID REFERENCES public.inventory_items(id) ON DELETE SET NULL,
  ip_address INET NOT NULL,
  snmp_community TEXT DEFAULT 'public',
  snmp_version INTEGER DEFAULT 2,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES public.isp_companies(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE public.equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.network_equipment ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for equipment_types
CREATE POLICY "Users can view their company equipment types" 
  ON public.equipment_types 
  FOR SELECT 
  USING (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create equipment types for their company" 
  ON public.equipment_types 
  FOR INSERT 
  WITH CHECK (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create RLS policies for network_equipment
CREATE POLICY "Users can view their company network equipment" 
  ON public.network_equipment 
  FOR SELECT 
  USING (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create network equipment for their company" 
  ON public.network_equipment 
  FOR INSERT 
  WITH CHECK (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their company network equipment" 
  ON public.network_equipment 
  FOR UPDATE 
  USING (
    isp_company_id IN (
      SELECT isp_company_id FROM public.profiles WHERE id = auth.uid()
    )
  );

-- Create the promote_inventory_to_equipment function
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
BEGIN
  -- Get the company_id and item name from the inventory item
  SELECT isp_company_id, COALESCE(name, type) 
  INTO company_id, item_name
  FROM public.inventory_items 
  WHERE id = inventory_item_id;
  
  IF company_id IS NULL THEN
    RAISE EXCEPTION 'Inventory item not found or access denied';
  END IF;
  
  -- Create the network equipment record
  INSERT INTO public.network_equipment (
    name,
    equipment_type_id,
    inventory_item_id,
    ip_address,
    snmp_community,
    snmp_version,
    notes,
    isp_company_id
  ) VALUES (
    item_name,
    (equipment_data->>'equipment_type_id')::UUID,
    inventory_item_id,
    (equipment_data->>'ip_address')::INET,
    COALESCE(equipment_data->>'snmp_community', 'public'),
    COALESCE((equipment_data->>'snmp_version')::INTEGER, 2),
    equipment_data->>'notes',
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

-- Insert some sample equipment types
INSERT INTO public.equipment_types (name, brand, model, category) VALUES
  ('Wireless Router', 'MikroTik', 'hAP ac²', 'Network Hardware'),
  ('Switch', 'MikroTik', 'CRS328-12P-4S+RM', 'Network Hardware'),
  ('Access Point', 'Ubiquiti', 'UniFi AC Pro', 'Network Hardware'),
  ('Router', 'Cisco', '2911', 'Network Hardware')
ON CONFLICT DO NOTHING;
