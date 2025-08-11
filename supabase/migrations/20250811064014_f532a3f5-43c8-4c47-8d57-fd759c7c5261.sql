
-- Add the missing barcode column to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN barcode character varying;

-- Create an index on barcode for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode 
ON public.inventory_items(barcode);
