
export type ClientType = 'individual' | 'business' | 'corporate' | 'government';
export type ConnectionType = 'fiber' | 'wireless' | 'satellite' | 'dsl';
export type ClientStatus = 'pending' | 'approved' | 'active' | 'suspended' | 'disconnected';
export type EquipmentStatus = 'available' | 'deployed' | 'maintenance' | 'retired';

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
  status: 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved';
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
  // Database fields for direct access
  id_number: string;
  mpesa_number: string | null;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  monthly_rate: number;
  address: string;
  county: string;
  sub_county: string;
  wallet_balance: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  approved_at: string | null;
  approved_by: string | null;
  service_packages?: {
    name: string;
    speed: string;
    monthly_rate: number;
  };
  equipment_assignments?: any[];
}

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  connection_types: ('fiber' | 'wireless' | 'satellite' | 'dsl')[];
  description: string | null;
  setup_fee?: number;
  data_limit?: number;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}
