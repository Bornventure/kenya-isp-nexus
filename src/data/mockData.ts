
import { ServicePackage } from '@/types/client';

export const mockServicePackages: ServicePackage[] = [
  {
    id: 'pkg-1',
    name: 'Basic Home',
    speed: '10 Mbps',
    monthly_rate: 2500,
    setup_fee: 500,
    data_limit: null,
    description: 'Perfect for basic home internet needs',
    connection_types: ['fiber', 'wireless'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    isp_company_id: 'company-1'
  },
  {
    id: 'pkg-2',
    name: 'Premium Home',
    speed: '25 Mbps',
    monthly_rate: 4500,
    setup_fee: 1000,
    data_limit: null,
    description: 'High-speed internet for streaming and gaming',
    connection_types: ['fiber', 'wireless'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    isp_company_id: 'company-1'
  },
  {
    id: 'pkg-3',
    name: 'Business Basic',
    speed: '50 Mbps',
    monthly_rate: 8500,
    setup_fee: 2000,
    data_limit: null,
    description: 'Reliable internet for small businesses',
    connection_types: ['fiber', 'wireless'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    isp_company_id: 'company-1'
  },
  {
    id: 'pkg-4',
    name: 'Business Premium',
    speed: '100 Mbps',
    monthly_rate: 15000,
    setup_fee: 5000,
    data_limit: null,
    description: 'High-performance internet for large businesses',
    connection_types: ['fiber'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    isp_company_id: 'company-1'
  },
  {
    id: 'pkg-5',
    name: 'Enterprise',
    speed: '1 Gbps',
    monthly_rate: 35000,
    setup_fee: 10000,
    data_limit: null,
    description: 'Ultra-fast internet for enterprise clients',
    connection_types: ['fiber'],
    is_active: true,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    isp_company_id: 'company-1'
  }
];
