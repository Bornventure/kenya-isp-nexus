
import { Client, ServicePackage } from '@/types/client';

export const mockServicePackages: ServicePackage[] = [
  {
    id: '1',
    name: 'Basic Fiber',
    speed: '10 Mbps',
    monthly_rate: 2500,
    connection_types: ['fiber'],
    description: 'Basic fiber internet package',
    is_active: true,
    isp_company_id: 'mock-company-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Premium Wireless',
    speed: '50 Mbps',
    monthly_rate: 5000,
    connection_types: ['wireless'],
    description: 'High-speed wireless internet',
    is_active: true,
    isp_company_id: 'mock-company-1',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }
];

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+254700000000',
    idNumber: '12345678',
    clientType: 'individual',
    status: 'active',
    connectionType: 'fiber',
    servicePackage: '1',
    monthlyRate: 2500,
    balance: 0,
    installationDate: '2024-01-15',
    location: {
      address: '123 Main St',
      county: 'Nairobi',
      subCounty: 'Westlands',
    },
    // Additional properties for compatibility
    address: '123 Main St',
    county: 'Nairobi',
    sub_county: 'Westlands',
    id_number: '12345678',
    client_type: 'individual',
    connection_type: 'fiber',
    service_package_id: '1',
    monthly_rate: 2500,
    wallet_balance: 0,
  } as Client
];
