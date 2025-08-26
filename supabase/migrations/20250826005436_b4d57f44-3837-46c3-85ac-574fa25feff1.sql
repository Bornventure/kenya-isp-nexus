
-- Add router_id column to radius_servers table to reference mikrotik_routers
ALTER TABLE radius_servers 
ADD COLUMN router_id uuid REFERENCES mikrotik_routers(id) ON DELETE CASCADE;

-- Create an index for better performance on the foreign key
CREATE INDEX IF NOT EXISTS idx_radius_servers_router_id ON radius_servers(router_id);

-- Update existing radius_servers to have proper relationship structure
-- (This assumes we might have existing data that needs to be handled)
-- Add a unique constraint to prevent duplicate router assignments
ALTER TABLE radius_servers 
ADD CONSTRAINT unique_router_radius_assignment UNIQUE(router_id);
