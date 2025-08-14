
import { Client } from '@/types/client';

export const transformClientForPortal = (client: Client) => {
  return {
    ...client,
    // Transform the client data to include portal-specific properties
    payments: client.payments || [],
    invoices: client.invoices || [],
    supportTickets: client.supportTickets || [],
    // Ensure computed properties are populated
    location: {
      address: client.address,
      county: client.county,
      subCounty: client.sub_county,
      coordinates: client.latitude && client.longitude ? {
        lat: client.latitude,
        lng: client.longitude
      } : undefined
    },
    servicePackage: client.service_packages?.name || 'Unknown Package',
    connectionType: client.connection_type,
    clientType: client.client_type,
    monthlyRate: client.monthly_rate,
    installationDate: client.installation_date || '',
    mpesaNumber: client.mpesa_number,
    idNumber: client.id_number,
    kraPinNumber: client.kra_pin_number,
    equipment: {
      serialNumbers: client.equipment_assignments?.map(eq => eq.equipment.serial_number) || []
    }
  };
};

export const validateClientLogin = (credentials: { phone: string; id_number: string }) => {
  // Basic validation
  if (!credentials.phone || !credentials.id_number) {
    return { isValid: false, error: 'Phone number and ID number are required' };
  }

  // Phone number validation (Kenyan format)
  const phoneRegex = /^(\+254|254|0)[7][0-9]{8}$/;
  if (!phoneRegex.test(credentials.phone)) {
    return { isValid: false, error: 'Please enter a valid Kenyan phone number' };
  }

  // ID number validation (basic)
  if (credentials.id_number.length < 7 || credentials.id_number.length > 8) {
    return { isValid: false, error: 'Please enter a valid ID number' };
  }

  return { isValid: true };
};

export const formatClientData = (client: Client) => {
  return {
    ...client,
    // Ensure all required computed properties are present
    lastPayment: client.payments && client.payments.length > 0 
      ? {
          date: client.payments[0].date,
          amount: client.payments[0].amount,
          method: client.payments[0].method as 'mpesa' | 'bank' | 'cash'
        }
      : undefined,
    // Calculate outstanding balance from invoices
    outstandingBalance: client.invoices?.reduce((total, invoice) => {
      return invoice.status === 'pending' ? total + invoice.amount : total;
    }, 0) || 0
  };
};
