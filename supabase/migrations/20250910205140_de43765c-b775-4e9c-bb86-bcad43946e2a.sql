-- Step 1: Add missing columns to existing tables
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS groupname TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS radius_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_error TEXT;

ALTER TABLE mikrotik_routers
ADD COLUMN IF NOT EXISTS sync_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS connection_status TEXT DEFAULT 'disconnected',
ADD COLUMN IF NOT EXISTS last_sync_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS last_error TEXT;