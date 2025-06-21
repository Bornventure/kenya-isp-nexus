import { ServicePackage } from '@/types/client';

// Keep only service packages as these are template data for package creation
export const servicePackages: ServicePackage[] = [
  {
    id: '84ea1832-7fc7-45a2-a3af-4fb8eef40ba6',
    name: 'Basic 5Mbps',
    speed: '5 Mbps',
    monthlyRate: 2500,
    description: 'Perfect for basic internet browsing and email',
    connectionType: ['fiber', 'wireless']
  },
  {
    id: '7b2d7e69-f1a5-413e-9597-31cda65d03f1',
    name: 'Standard 10Mbps',
    speed: '10 Mbps',
    monthlyRate: 3500,
    description: 'Ideal for streaming and video calls',
    connectionType: ['fiber', 'wireless']
  },
  {
    id: 'df4712c7-7582-46c9-a72c-049fd2b4c378',
    name: 'Premium 25Mbps',
    speed: '25 Mbps',
    monthlyRate: 5000,
    description: 'High-speed for multiple devices and HD streaming',
    connectionType: ['fiber']
  },
  {
    id: '02d16326-a1bb-47c3-8045-0ae11b8c3c57',
    name: 'Business 50Mbps',
    speed: '50 Mbps',
    monthlyRate: 8000,
    description: 'Enterprise-grade connectivity for business use',
    connectionType: ['fiber']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Enterprise 100Mbps',
    speed: '100 Mbps',
    monthlyRate: 12000,
    description: 'Maximum speed for large organizations',
    connectionType: ['fiber']
  }
];

// All mock client data removed - now using real database data
export const mockClients: any[] = [];
