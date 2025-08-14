
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number: string;
  address: string;
  county: string;
  sub_county: string;
  latitude?: number;
  longitude?: number;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  service_package_id: string;
  monthly_rate: number;
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  balance: number;
  wallet_balance: number;
  is_active: boolean;
  subscription_start_date?: string;
  subscription_end_date?: string;
  installation_date?: string;
  installation_status?: string;
  installation_completed_at?: string;
  installation_completed_by?: string;
  service_activated_at?: string;
  approved_at?: string;
  approved_by?: string;
  submitted_by: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  service_packages?: {
    id: string;
    name: string;
    speed: string;
    monthly_rate: number;
  };
  equipment_assignments?: Array<{
    equipment: {
      model: string;
      serial_number: string;
    };
  }>;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  speed: string;  
  monthly_rate: number;
  setup_fee?: number;
  data_limit?: number;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}
