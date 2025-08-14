
export type ClientType = 'individual' | 'business' | 'corporate' | 'government';
export type ConnectionType = 'fiber' | 'wireless' | 'satellite' | 'dsl';
export type ClientStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected';

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number?: string;
  client_type: ClientType;
  connection_type: ConnectionType;
  monthly_rate: number;
  status: ClientStatus;
  service_package_id?: string;
  latitude?: number;
  longitude?: number;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  description?: string;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}
