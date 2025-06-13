
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  accountType: 'internet' | 'software';
  role: 'client' | 'admin' | 'super-admin';
  isVerified: boolean;
  clientData?: {
    id_number: string;
    client_type: string;
    status: string;
    connection_type: string;
    monthly_rate: number;
    installation_date: string;
    address: string;
    county: string;
    sub_county: string;
    balance: number;
    phone: string;
    mpesa_number: string;
    service_packages: string;
    payments: any[];
    invoices: any[];
    support_tickets: any[];
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
}
