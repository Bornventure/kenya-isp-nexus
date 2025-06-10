import { Client, ServicePackage } from '@/types/client';

export const servicePackages: ServicePackage[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Basic 5Mbps',
    speed: '5 Mbps',
    monthlyRate: 2500,
    description: 'Perfect for basic internet browsing and email',
    connectionType: ['fiber', 'wireless']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Standard 10Mbps',
    speed: '10 Mbps',
    monthlyRate: 3500,
    description: 'Ideal for streaming and video calls',
    connectionType: ['fiber', 'wireless']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Premium 25Mbps',
    speed: '25 Mbps',
    monthlyRate: 5000,
    description: 'High-speed for multiple devices and HD streaming',
    connectionType: ['fiber']
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
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

export const mockClients: Client[] = [
  {
    id: '1',
    name: 'John Otieno',
    email: 'john.otieno@email.com',
    phone: '+254712345678',
    mpesaNumber: '+254712345678',
    idNumber: '12345678',
    clientType: 'individual',
    status: 'active',
    connectionType: 'fiber',
    servicePackage: 'Standard 10Mbps',
    monthlyRate: 4000,
    installationDate: '2024-01-15',
    location: {
      address: 'Milimani Estate, Plot 45',
      county: 'Kisumu',
      subCounty: 'Kisumu Central',
      coordinates: { lat: -0.0917, lng: 34.7680 }
    },
    equipment: {
      router: 'TP-Link AC1200',
      serialNumbers: ['TL001234', 'MD567890']
    },
    balance: 0,
    lastPayment: {
      date: '2024-05-01',
      amount: 4000,
      method: 'mpesa'
    }
  },
  {
    id: '2',
    name: 'Grace Nyong\'o',
    email: 'grace.nyongo@email.com',
    phone: '+254723456789',
    mpesaNumber: '+254723456789',
    idNumber: '23456789',
    clientType: 'individual',
    status: 'active',
    connectionType: 'wireless',
    servicePackage: 'Basic 5Mbps',
    monthlyRate: 2500,
    installationDate: '2024-02-20',
    location: {
      address: 'Nyalenda A, House 23',
      county: 'Kisumu',
      subCounty: 'Kisumu East',
      coordinates: { lat: -0.1108, lng: 34.7617 }
    },
    equipment: {
      router: 'Huawei B315',
      serialNumbers: ['HW002345']
    },
    balance: -2500,
    lastPayment: {
      date: '2024-04-01',
      amount: 2500,
      method: 'mpesa'
    }
  },
  {
    id: '3',
    name: 'Kisumu Medical Center',
    email: 'admin@kisumumedical.co.ke',
    phone: '+254734567890',
    mpesaNumber: '+254734567890',
    idNumber: 'P051234567H',
    kraPinNumber: 'P051234567H',
    clientType: 'business',
    status: 'active',
    connectionType: 'fiber',
    servicePackage: 'Enterprise 50Mbps',
    monthlyRate: 15000,
    installationDate: '2023-11-10',
    location: {
      address: 'Oginga Odinga Street, CBD',
      county: 'Kisumu',
      subCounty: 'Kisumu Central',
      coordinates: { lat: -0.0945, lng: 34.7692 }
    },
    equipment: {
      router: 'Cisco RV340',
      modem: 'Huawei EchoLife',
      serialNumbers: ['CS003456', 'HE789012']
    },
    balance: 0,
    lastPayment: {
      date: '2024-05-15',
      amount: 15000,
      method: 'bank'
    }
  },
  {
    id: '4',
    name: 'Peter Ouma',
    email: 'peter.ouma@email.com',
    phone: '+254745678901',
    mpesaNumber: '+254745678901',
    idNumber: '34567890',
    clientType: 'individual',
    status: 'suspended',
    connectionType: 'fiber',
    servicePackage: 'Premium 25Mbps',
    monthlyRate: 7500,
    installationDate: '2024-03-05',
    location: {
      address: 'Mamboleo Estate, Block C',
      county: 'Kisumu',
      subCounty: 'Kisumu West',
      coordinates: { lat: -0.0845, lng: 34.7156 }
    },
    equipment: {
      router: 'Netgear R6120',
      serialNumbers: ['NG004567']
    },
    balance: -15000,
    lastPayment: {
      date: '2024-03-01',
      amount: 7500,
      method: 'mpesa'
    }
  },
  {
    id: '5',
    name: 'Kondele Community Center',
    email: 'info@kondelecenter.org',
    phone: '+254756789012',
    mpesaNumber: '+254756789012',
    idNumber: 'NGO/001/2020',
    clientType: 'government',
    status: 'active',
    connectionType: 'wireless',
    servicePackage: 'Standard 10Mbps',
    monthlyRate: 4000,
    installationDate: '2024-01-30',
    location: {
      address: 'Kondele Market Area',
      county: 'Kisumu',
      subCounty: 'Kisumu Central',
      coordinates: { lat: -0.1028, lng: 34.7445 }
    },
    equipment: {
      router: 'Ubiquiti NanoStation',
      serialNumbers: ['UB005678']
    },
    balance: 0,
    lastPayment: {
      date: '2024-05-10',
      amount: 4000,
      method: 'bank'
    }
  }
];
