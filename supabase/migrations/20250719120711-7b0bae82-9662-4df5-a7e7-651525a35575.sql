
-- Add client_id column to bandwidth_statistics table for tracking client usage
ALTER TABLE bandwidth_statistics 
ADD COLUMN client_id uuid REFERENCES clients(id);

-- Add data_cap_gb column to service_packages table for data cap enforcement
ALTER TABLE service_packages 
ADD COLUMN data_cap_gb numeric DEFAULT NULL;

-- Add index for better performance when querying client bandwidth usage
CREATE INDEX IF NOT EXISTS idx_bandwidth_statistics_client_id_timestamp 
ON bandwidth_statistics(client_id, timestamp);

-- Add index for better performance when querying monthly usage
CREATE INDEX IF NOT EXISTS idx_bandwidth_statistics_client_timestamp 
ON bandwidth_statistics(client_id, timestamp DESC);
