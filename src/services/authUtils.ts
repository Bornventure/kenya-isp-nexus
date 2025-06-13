
import { Client } from '@/types/client';
import { User } from '@/types';

export const clientToUser = (client: Client): User => {
  console.log('Converting client to user, client data:', client);
  console.log('Client status in conversion:', client.status);
  
  return {
    id: client.id,
    email: client.email,
    firstName: client.name.split(' ')[0] || '',
    lastName: client.name.split(' ').slice(1).join(' ') || '',
    phone: client.phone,
    accountType: 'internet' as const,
    role: 'client' as const,
    isVerified: client.status === 'active',
    clientData: {
      id_number: client.idNumber,
      client_type: client.clientType,
      status: client.status,
      connection_type: client.connectionType,
      monthly_rate: client.monthlyRate,
      installation_date: client.installationDate,
      address: client.location.address,
      county: client.location.county,
      sub_county: client.location.subCounty,
      balance: client.balance,
      phone: client.phone,
      mpesa_number: client.mpesaNumber || '',
      service_packages: client.servicePackage,
      payments: client.payments || [],
      invoices: client.invoices || [],
      support_tickets: client.supportTickets || [],
    },
  };
};

export const formatCurrency = (amount: number): string => {
  return `KES ${amount.toLocaleString()}`;
};

export const isClientActive = (client: Client): boolean => {
  return client.status === 'active';
};

export const getAccountStatusMessage = (client: Client): string => {
  switch (client.status) {
    case 'pending':
      return 'Account is pending activation. Please contact support.';
    case 'suspended':
      return 'Account is suspended. Please contact support or make payment to reactivate.';
    case 'disconnected':
      return 'Account is disconnected. Please contact support for reconnection.';
    case 'active':
      return 'Account is active and operational.';
    default:
      return 'Please contact support for account status information.';
  }
};

export const hasOverdueInvoices = (client: Client): boolean => {
  const today = new Date();
  return (client.invoices || []).some(invoice => 
    invoice.status === 'pending' && new Date(invoice.due_date) < today
  );
};

export const getNextPaymentDue = (client: Client): string | null => {
  const pendingInvoices = (client.invoices || [])
    .filter(invoice => invoice.status === 'pending')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  return pendingInvoices.length > 0 ? pendingInvoices[0].due_date : null;
};
