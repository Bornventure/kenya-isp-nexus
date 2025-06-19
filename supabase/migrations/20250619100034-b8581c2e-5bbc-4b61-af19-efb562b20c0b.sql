
-- Make item_id nullable temporarily to allow inserts without it
-- The trigger will still auto-generate the value
ALTER TABLE public.inventory_items 
ALTER COLUMN item_id DROP NOT NULL;

-- Add a constraint to ensure item_id is never actually null after insert
-- This will be enforced by the trigger that generates the ID
ALTER TABLE public.inventory_items 
ADD CONSTRAINT check_item_id_not_empty 
CHECK (item_id IS NOT NULL AND item_id != '');
