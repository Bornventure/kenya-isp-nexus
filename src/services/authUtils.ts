
import { Client } from '@/types/client';

export const isClientActive = (client: Client): boolean => {
  return client.status === 'active' && client.is_active;
};

export const getAccountStatusMessage = (client: Client): string => {
  switch (client.status) {
    case 'active':
      return 'Account is active and in good standing';
    case 'suspended':
      return 'Account is suspended due to non-payment';
    case 'pending':
      return 'Account is pending approval';
    case 'inactive':
      return 'Account is inactive';
    case 'disconnected':
      return 'Account has been disconnected';
    case 'approved':
      return 'Account is approved and ready for activation';
    default:
      return 'Account status unknown';
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(amount);
};

export const hasOverdueInvoices = (client: Client): boolean => {
  return client.balance < 0;
};

export const getNextPaymentDue = (client: Client): string | null => {
  if (client.subscription_end_date) {
    return new Date(client.subscription_end_date).toLocaleDateString();
  }
  return null;
};

export const clientToUser = (client: Client) => {
  return {
    id: client.id,
    name: client.name,
    email: client.email,
    phone: client.phone,
    role: 'client' as const,
    client_id: client.id,
    isp_company_id: client.isp_company_id,
  };
};
