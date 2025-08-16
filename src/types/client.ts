
export type ClientStatus = 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved' | 'rejected';
export type ClientType = 'individual' | 'business' | 'corporate' | 'government';
export type ConnectionType = 'fiber' | 'wireless' | 'satellite' | 'dsl';

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  connection_types: ConnectionType[];
  description: string | null;
  setup_fee?: number;
  data_limit?: number;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  kraPinNumber?: string;
  mpesaNumber?: string;
  clientType: ClientType;
  status: ClientStatus;
  connectionType: ConnectionType;
  servicePackage: string;
  monthlyRate: number;
  balance: number;
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
  lastPayment?: {
    date: string;
    amount: number;
    method: string;
  };
  // Additional properties to match DatabaseClient usage
  address: string;
  county: string;
  sub_county: string;
  id_number: string;
  kra_pin_number?: string;
  mpesa_number?: string;
  client_type: ClientType;
  connection_type: ConnectionType;
  service_package_id: string;
  monthly_rate: number;
  wallet_balance: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
  approved_at?: string;
  approved_by?: string;
  service_packages?: ServicePackage | null;
}
