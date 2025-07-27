
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

// Legacy Client interface for backwards compatibility
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  mpesaNumber?: string;
  idNumber: string;
  kraPinNumber?: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  status: ClientStatus;
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  servicePackage: string;
  monthlyRate: number;
  installationDate: string;
  location: {
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
  balance: number;
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
  description?: string;
  features?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
}

export interface ClientLoginCredentials {
  email: string;
  password: string;
  clientId: string;
}
