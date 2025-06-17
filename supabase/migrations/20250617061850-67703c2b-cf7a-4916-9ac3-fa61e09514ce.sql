
-- Add a column to link inventory items to equipment records
ALTER TABLE public.inventory_items 
ADD COLUMN equipment_id UUID REFERENCES equipment(id);

-- Add a column to track if an inventory item is promoted to network equipment
ALTER TABLE public.inventory_items 
ADD COLUMN is_network_equipment BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX idx_inventory_items_equipment_id ON inventory_items(equipment_id);
CREATE INDEX idx_inventory_items_network_equipment ON inventory_items(is_network_equipment);

-- Create a function to promote inventory item to network equipment
CREATE OR REPLACE FUNCTION promote_inventory_to_equipment(
  inventory_item_id UUID,
  equipment_data JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  equipment_id UUID;
  inventory_item RECORD;
BEGIN
  -- Get the inventory item
  SELECT * INTO inventory_item 
  FROM inventory_items 
  WHERE id = inventory_item_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Inventory item not found';
  END IF;
  
  -- Create equipment record
  INSERT INTO equipment (
    type, brand, model, serial_number, mac_address,
    status, isp_company_id, equipment_type_id,
    ip_address, snmp_community, snmp_version,
    notes, approval_status
  ) VALUES (
    inventory_item.type,
    inventory_item.manufacturer,
    inventory_item.model,
    inventory_item.serial_number,
    inventory_item.mac_address,
    'pending_approval',
    inventory_item.isp_company_id,
    (equipment_data->>'equipment_type_id')::UUID,
    (equipment_data->>'ip_address')::INET,
    COALESCE(equipment_data->>'snmp_community', 'public'),
    COALESCE((equipment_data->>'snmp_version')::INTEGER, 2),
    COALESCE(equipment_data->>'notes', 'Promoted from inventory'),
    'pending'
  ) RETURNING id INTO equipment_id;
  
  -- Update inventory item to link to equipment
  UPDATE inventory_items 
  SET equipment_id = equipment_id,
      is_network_equipment = true,
      status = 'Deployed'
  WHERE id = inventory_item_id;
  
  RETURN equipment_id;
END;
$$;

-- Update the client_equipment table to optionally reference inventory items
ALTER TABLE public.client_equipment 
ADD COLUMN inventory_item_id UUID REFERENCES inventory_items(id);

-- Add index for the new column
CREATE INDEX idx_client_equipment_inventory_item ON client_equipment(inventory_item_id);
