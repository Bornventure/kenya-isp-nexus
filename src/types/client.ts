
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  mpesaNumber?: string;
  idNumber: string;
  kraPinNumber?: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  status: 'active' | 'suspended' | 'disconnected' | 'pending';
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
  monthlyRate: number;
  connectionType: string[];
  description: string;
}

export interface ClientLoginCredentials {
  email: string;
  id_number: string;
}
