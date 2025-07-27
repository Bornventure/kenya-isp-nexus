
export type ClientStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected';

export interface DatabaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  monthly_rate: number;
  status: ClientStatus;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  installation_status?: string;
  installation_completed_by?: string;
  installation_completed_at?: string;
  service_activated_at?: string;
  service_packages?: {
    name: string;
  };
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  service_package_id?: string;
  client_type: string;
  connection_type: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number?: string;
  subscription_type?: string;
  latitude?: number;
  longitude?: number;
  balance?: number;
  is_active: boolean;
  wallet_balance?: number;
  installation_date?: string;
  subscription_start_date?: string;
  subscription_end_date?: string;
}
