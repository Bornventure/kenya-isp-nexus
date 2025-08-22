
export type ClientType = 'individual' | 'business' | 'corporate' | 'government';
export type ConnectionType = 'fiber' | 'wireless' | 'satellite' | 'dsl';
export type ClientStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected' | 'rejected';

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
  balance?: number;
  wallet_balance?: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  subscription_type?: string;
  is_active?: boolean;
  submitted_by?: string;
  approved_by?: string;
  approved_at?: string;
  rejected_by?: string;
  rejected_at?: string;
  rejection_reason?: string;
  installation_status?: string;
  installation_completed_by?: string;
  installation_completed_at?: string;
  service_activated_at?: string;
  installation_date?: string;
  notes?: string;
  
  // Legacy camelCase properties for backwards compatibility
  clientType: ClientType;
  connectionType: ConnectionType;
  servicePackage?: string;
  monthlyRate: number;
  installationDate?: string;
  idNumber: string;
  kraPinNumber?: string;
  mpesaNumber?: string;
  
  // Nested objects
  location?: {
    address: string;
    county: string;
    subCounty: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  equipment?: {
    router?: string;
    modem?: string;
    serialNumbers: string[];
  };
  
  service_packages?: {
    id: string;
    name: string;
    speed: string;
    monthly_rate: number;
    setup_fee?: number;
    description?: string;
    is_active: boolean;
    isp_company_id: string;
    created_at: string;
    updated_at: string;
  };
  
  equipment_assignments?: any[];
  lastPayment?: {
    date: string;
    amount: number;
    method: 'mpesa' | 'bank' | 'cash';
  };
  payments?: any[];
  invoices?: any[];
  supportTickets?: any[];
}

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  setup_fee?: number;
  data_limit?: number | null;
  description?: string;
  connection_types?: string[];
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}
