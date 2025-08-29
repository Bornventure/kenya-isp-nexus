
export interface Equipment {
  id: string;
  name?: string;
  serial_number: string;
  model: string;
  type: string;
  brand?: string;
  manufacturer?: string;
  status: 'available' | 'deployed' | 'maintenance' | 'retired' | 'assigned';
  purchase_date?: string;
  warranty_expiry?: string;
  warranty_end_date?: string;
  mac_address?: string;
  location?: string;
  notes?: string;
  equipment_type_id?: string;
  equipment_types?: {
    name: string;
  };
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  client_id?: string;
  ip_address?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  auto_discovered?: boolean;
  base_station_id?: string;
  firmware_version?: string;
  port_number?: number;
  snmp_community?: string;
  snmp_version?: number;
  vlan_id?: number;
  location_coordinates?: any;
  connection_status?: 'connected' | 'disconnected';
}

export interface EquipmentType {
  id: string;
  name: string;
  brand: string;
  model: string;
  device_type: string;
  default_config?: any;
  snmp_settings?: any;
  created_at: string;
  updated_at: string;
}
