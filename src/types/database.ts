
export interface DatabaseClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  kra_pin_number: string;
  mpesa_number: string;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  status: 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved' | 'rejected';
  monthly_rate: number;
  installation_date: string;
  subscription_start_date: string;
  subscription_end_date: string;
  subscription_type: string;
  balance: number;
  wallet_balance: number;
  service_package_id: string;
  isp_company_id: string;
  approved_at: string;
  approved_by: string;
  created_at: string;
  updated_at: string;
  notes: string | null;
  rejection_reason: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  latitude: number | null;
  longitude: number | null;
  installation_status?: string;
  submitted_by?: string;
  service_activated_at?: string;
  service_packages?: {
    id: string;
    name: string;
    monthly_rate: number;
    speed: string;
    description: string;
  } | null;
}
