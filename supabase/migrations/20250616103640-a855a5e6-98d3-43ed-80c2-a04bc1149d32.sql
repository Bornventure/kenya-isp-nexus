
-- Create equipment_types table for pre-defined devices
CREATE TABLE public.equipment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand VARCHAR NOT NULL,
  model VARCHAR NOT NULL,
  device_type VARCHAR NOT NULL CHECK (device_type IN ('router', 'switch', 'access_point', 'modem', 'antenna', 'cable')),
  default_config JSONB,
  snmp_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update equipment table to support SNMP management
ALTER TABLE public.equipment 
ADD COLUMN IF NOT EXISTS equipment_type_id UUID REFERENCES equipment_types(id),
ADD COLUMN IF NOT EXISTS ip_address INET,
ADD COLUMN IF NOT EXISTS snmp_community VARCHAR DEFAULT 'public',
ADD COLUMN IF NOT EXISTS snmp_version INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS port_number INTEGER,
ADD COLUMN IF NOT EXISTS vlan_id INTEGER,
ADD COLUMN IF NOT EXISTS location_coordinates POINT,
ADD COLUMN IF NOT EXISTS auto_discovered BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS approval_status VARCHAR DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS base_station_id UUID REFERENCES base_stations(id);

-- Create client_equipment mapping table
CREATE TABLE public.client_equipment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES profiles(id),
  is_primary BOOLEAN DEFAULT false,
  network_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create network_events table for SNMP logging
CREATE TABLE public.network_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  equipment_id UUID REFERENCES equipment(id),
  event_type VARCHAR NOT NULL CHECK (event_type IN ('connect', 'disconnect', 'reconnect', 'status_change', 'auto_discovery')),
  event_data JSONB,
  triggered_by VARCHAR CHECK (triggered_by IN ('snmp_auto', 'manual', 'billing_system', 'auto_discovery')),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  isp_company_id UUID REFERENCES isp_companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert some pre-defined equipment types
INSERT INTO equipment_types (name, brand, model, device_type, default_config, snmp_settings) VALUES
('Mikrotik hAP ac2', 'Mikrotik', 'hAP ac2', 'router', 
 '{"ports": 5, "wifi": true, "max_clients": 50}',
 '{"version": 2, "community": "public", "ports_oid": "1.3.6.1.2.1.2.2.1.7"}'),
('Mikrotik RB951Ui-2HnD', 'Mikrotik', 'RB951Ui-2HnD', 'router',
 '{"ports": 5, "wifi": true, "max_clients": 30}',
 '{"version": 2, "community": "public", "ports_oid": "1.3.6.1.2.1.2.2.1.7"}'),
('Ubiquiti UniFi Dream Machine', 'Ubiquiti', 'UDM', 'router',
 '{"ports": 4, "wifi": true, "max_clients": 100}',
 '{"version": 3, "community": "public", "ports_oid": "1.3.6.1.2.1.2.2.1.7"}'),
('Cisco Catalyst 2960', 'Cisco', '2960', 'switch',
 '{"ports": 24, "vlan_support": true}',
 '{"version": 2, "community": "public", "vlan_oid": "1.3.6.1.2.1.17.7.1.4.3.1.1"}'),
('TP-Link TL-SG1016D', 'TP-Link', 'TL-SG1016D', 'switch',
 '{"ports": 16, "managed": false}',
 '{"version": 2, "community": "public"}'),
('Ubiquiti NanoStation 5AC', 'Ubiquiti', 'NanoStation 5AC', 'access_point',
 '{"wifi": true, "frequency": "5GHz", "max_clients": 100}',
 '{"version": 2, "community": "public", "mac_filter_oid": "1.3.6.1.4.1.9.9.273.1.1.1.1.1"}'),
('Ubiquiti UniFi AC Pro', 'Ubiquiti', 'UAP-AC-PRO', 'access_point',
 '{"wifi": true, "dual_band": true, "max_clients": 200}',
 '{"version": 2, "community": "public", "mac_filter_oid": "1.3.6.1.4.1.9.9.273.1.1.1.1.1"}'),
('Huawei HG8245H', 'Huawei', 'HG8245H', 'modem',
 '{"ports": 4, "wifi": true, "fiber": true}',
 '{"version": 2, "community": "public"}'
);

-- Add RLS policies for new tables
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_events ENABLE ROW LEVEL SECURITY;

-- Equipment types policies (readable by all authenticated users)
CREATE POLICY "Equipment types are viewable by authenticated users" ON equipment_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Client equipment policies
CREATE POLICY "Users can view client equipment for their company" ON client_equipment
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients c, profiles p 
      WHERE c.id = client_equipment.client_id 
      AND p.id = auth.uid() 
      AND c.isp_company_id = p.isp_company_id
    )
  );

CREATE POLICY "Users can manage client equipment for their company" ON client_equipment
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM clients c, profiles p 
      WHERE c.id = client_equipment.client_id 
      AND p.id = auth.uid() 
      AND c.isp_company_id = p.isp_company_id
    )
  );

-- Network events policies
CREATE POLICY "Users can view network events for their company" ON network_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND network_events.isp_company_id = p.isp_company_id
    )
  );

CREATE POLICY "Users can create network events for their company" ON network_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND network_events.isp_company_id = p.isp_company_id
    )
  );

-- Add indexes for performance
CREATE INDEX idx_equipment_ip_address ON equipment(ip_address);
CREATE INDEX idx_equipment_mac_address ON equipment(mac_address);
CREATE INDEX idx_equipment_approval_status ON equipment(approval_status);
CREATE INDEX idx_client_equipment_client_id ON client_equipment(client_id);
CREATE INDEX idx_client_equipment_equipment_id ON client_equipment(equipment_id);
CREATE INDEX idx_network_events_client_id ON network_events(client_id);
CREATE INDEX idx_network_events_created_at ON network_events(created_at);
