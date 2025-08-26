
-- Add last_synced_at column to radius_servers table for tracking sync status
ALTER TABLE radius_servers
ADD COLUMN last_synced_at timestamptz DEFAULT NULL;

-- Add an index for better performance when querying by sync status
CREATE INDEX IF NOT EXISTS idx_radius_servers_last_synced ON radius_servers(last_synced_at);
