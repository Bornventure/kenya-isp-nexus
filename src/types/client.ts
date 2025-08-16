
export type ClientStatus = 'active' | 'suspended' | 'disconnected' | 'pending' | 'approved';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string;
  kraPinNumber?: string;
  mpesaNumber?: string;
  clientType: 'individual' | 'business' | 'corporate' | 'government';
  status: ClientStatus;
  connectionType: 'fiber' | 'wireless' | 'satellite' | 'dsl';
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
}
