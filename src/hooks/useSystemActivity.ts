
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SystemActivity {
  id: string;
  activity_type: string;
  description: string;
  client_name?: string;
  amount?: number;
  created_at: string;
  performed_by?: string;
}

export const useSystemActivity = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['system-activity', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      // Get recent payments with client information
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          id,
          amount,
          payment_method,
          payment_date,
          clients (
            name
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('payment_date', { ascending: false })
        .limit(10);

      // Get recent wallet transactions
      const { data: walletTransactions } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          amount,
          transaction_type,
          description,
          created_at,
          clients (
            name
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Get recent client registrations
      const { data: newClients } = await supabase
        .from('clients')
        .select('id, name, created_at, monthly_rate')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities: SystemActivity[] = [];

      // Process payments
      payments?.forEach(payment => {
        activities.push({
          id: `payment-${payment.id}`,
          activity_type: 'payment',
          description: `${payment.clients?.name || 'Unknown Client'} made a payment of KES ${payment.amount?.toFixed(2) || '0.00'} via ${payment.payment_method}`,
          client_name: payment.clients?.name,
          amount: payment.amount,
          created_at: payment.payment_date,
        });
      });

      // Process wallet transactions
      walletTransactions?.forEach(transaction => {
        if (transaction.transaction_type === 'credit') {
          activities.push({
            id: `transaction-${transaction.id}`,
            activity_type: 'wallet_credit',
            description: `${transaction.clients?.name || 'Unknown Client'} credited their wallet with KES ${transaction.amount?.toFixed(2) || '0.00'}`,
            client_name: transaction.clients?.name,
            amount: transaction.amount,
            created_at: transaction.created_at,
          });
        } else if (transaction.transaction_type === 'debit') {
          activities.push({
            id: `transaction-${transaction.id}`,
            activity_type: 'service_renewal',
            description: `${transaction.clients?.name || 'Unknown Client'} renewed their service (KES ${transaction.amount?.toFixed(2) || '0.00'} deducted)`,
            client_name: transaction.clients?.name,
            amount: transaction.amount,
            created_at: transaction.created_at,
          });
        }
      });

      // Process new clients
      newClients?.forEach(client => {
        activities.push({
          id: `client-${client.id}`,
          activity_type: 'client_registration',
          description: `New client ${client.name} registered with ${client.monthly_rate ? `KES ${client.monthly_rate?.toFixed(2)}/month package` : 'default package'}`,
          client_name: client.name,
          created_at: client.created_at,
        });
      });

      // Sort all activities by date
      return activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
