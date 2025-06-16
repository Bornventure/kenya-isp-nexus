
-- Create inventory_items table to store all physical and logical assets
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id VARCHAR(50) UNIQUE NOT NULL, -- User-friendly ID like INV-001
  category VARCHAR(50) NOT NULL CHECK (category IN ('Network Hardware', 'CPE', 'Infrastructure', 'Logical Resource', 'Consumable')),
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255),
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  serial_number VARCHAR(100) UNIQUE,
  mac_address VARCHAR(17) UNIQUE,
  purchase_date DATE,
  warranty_expiry_date DATE,
  supplier VARCHAR(255),
  cost DECIMAL(10,2),
  location VARCHAR(255),
  status VARCHAR(50) NOT NULL DEFAULT 'In Stock',
  assigned_customer_id UUID REFERENCES clients(id),
  assigned_device_id UUID,
  assignment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  
  -- Infrastructure specific fields
  location_start_lat DECIMAL(10, 8),
  location_start_lng DECIMAL(11, 8),
  location_end_lat DECIMAL(10, 8),
  location_end_lng DECIMAL(11, 8),
  length_meters INTEGER,
  capacity VARCHAR(50),
  installation_date DATE,
  last_maintenance_date DATE,
  
  -- Logical resources specific fields
  ip_address INET,
  subnet_mask VARCHAR(50),
  
  -- Consumables specific fields
  item_sku VARCHAR(100),
  quantity_in_stock INTEGER,
  reorder_level INTEGER,
  unit_cost DECIMAL(10,2),
  
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_history table for audit logs
CREATE TABLE public.inventory_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  isp_company_id UUID REFERENCES isp_companies(id)
);

-- Create indexes for better performance
CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_assigned_customer ON inventory_items(assigned_customer_id);
CREATE INDEX idx_inventory_items_company ON inventory_items(isp_company_id);
CREATE INDEX idx_inventory_history_item ON inventory_history(inventory_item_id);

-- Enable Row Level Security
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for inventory_items
CREATE POLICY "Users can view their company's inventory items" 
  ON public.inventory_items 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can create inventory items for their company" 
  ON public.inventory_items 
  FOR INSERT 
  WITH CHECK (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can update their company's inventory items" 
  ON public.inventory_items 
  FOR UPDATE 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can delete their company's inventory items" 
  ON public.inventory_items 
  FOR DELETE 
  USING (isp_company_id = get_current_user_company_id());

-- Create RLS policies for inventory_history
CREATE POLICY "Users can view their company's inventory history" 
  ON public.inventory_history 
  FOR SELECT 
  USING (isp_company_id = get_current_user_company_id());

CREATE POLICY "Users can create inventory history for their company" 
  ON public.inventory_history 
  FOR INSERT 
  WITH CHECK (isp_company_id = get_current_user_company_id());

-- Create function to automatically generate item_id
CREATE OR REPLACE FUNCTION generate_inventory_item_id()
RETURNS TRIGGER AS $$
DECLARE
  category_prefix VARCHAR(5);
  next_number INTEGER;
  new_item_id VARCHAR(50);
BEGIN
  -- Generate prefix based on category
  CASE NEW.category
    WHEN 'Network Hardware' THEN category_prefix := 'NH';
    WHEN 'CPE' THEN category_prefix := 'CPE';
    WHEN 'Infrastructure' THEN category_prefix := 'INF';
    WHEN 'Logical Resource' THEN category_prefix := 'LR';
    WHEN 'Consumable' THEN category_prefix := 'CON';
    ELSE category_prefix := 'INV';
  END CASE;
  
  -- Get next number for this category
  SELECT COALESCE(MAX(CAST(SUBSTRING(item_id FROM '[0-9]+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM inventory_items 
  WHERE category = NEW.category AND isp_company_id = NEW.isp_company_id;
  
  -- Generate new item_id
  new_item_id := category_prefix || '-' || LPAD(next_number::TEXT, 4, '0');
  
  NEW.item_id := new_item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate item_id
CREATE TRIGGER trigger_generate_inventory_item_id
  BEFORE INSERT ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION generate_inventory_item_id();

-- Create function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
  action_text VARCHAR(100);
  details_text TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    action_text := 'Item Created';
    details_text := 'New ' || NEW.category || ' item added: ' || COALESCE(NEW.name, NEW.model, 'Unnamed item');
    
    INSERT INTO inventory_history (inventory_item_id, action, details, performed_by, isp_company_id)
    VALUES (NEW.id, action_text, details_text, auth.uid(), NEW.isp_company_id);
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Log status changes
    IF OLD.status != NEW.status THEN
      action_text := 'Status Changed';
      details_text := 'Status changed from ' || OLD.status || ' to ' || NEW.status;
      
      IF NEW.assigned_customer_id IS NOT NULL AND OLD.assigned_customer_id IS NULL THEN
        details_text := details_text || '. Assigned to customer.';
      ELSIF NEW.assigned_customer_id IS NULL AND OLD.assigned_customer_id IS NOT NULL THEN
        details_text := details_text || '. Unassigned from customer.';
      END IF;
      
      INSERT INTO inventory_history (inventory_item_id, action, details, performed_by, isp_company_id)
      VALUES (NEW.id, action_text, details_text, auth.uid(), NEW.isp_company_id);
    END IF;
    
    -- Log assignment changes
    IF OLD.assigned_customer_id IS DISTINCT FROM NEW.assigned_customer_id THEN
      IF NEW.assigned_customer_id IS NOT NULL THEN
        action_text := 'Assigned to Customer';
        details_text := 'Item assigned to customer ID: ' || NEW.assigned_customer_id;
      ELSE
        action_text := 'Unassigned from Customer';
        details_text := 'Item unassigned from customer';
      END IF;
      
      INSERT INTO inventory_history (inventory_item_id, action, details, performed_by, isp_company_id)
      VALUES (NEW.id, action_text, details_text, auth.uid(), NEW.isp_company_id);
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to log inventory changes
CREATE TRIGGER trigger_log_inventory_change
  AFTER INSERT OR UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION log_inventory_change();
