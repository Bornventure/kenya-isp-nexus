
-- Update the user_role enum to include all department roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'customer_support';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'billing_admin';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'network_engineer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'infrastructure_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'hotspot_admin';
