
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { useEffect } from 'react';

export interface ClientWalletTransaction {
  id: string;
  transaction_type: 'credit' | 'debit' | 'payment' | 'refund';
  amount: number;
  description: string | null;
  reference_number: string | null;
  mpesa_receipt_number: string | null;
  payment_method?: string | null;
  created_at: string;
}

export const useClientWalletTransactions = () => {
  const { client } = useClientAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['client-wallet-transactions', client?.id],
    queryFn: async () => {
      if (!client?.id) return [];

      console.log('Fetching client wallet transactions via edge function for:', client.id);
      
      try {
        const { data, error } = await supabase.functions.invoke('get-client-wallet-transactions', {
          body: { 
            client_id: client.id,
            client_email: client.email,
            client_id_number: client.id_number
          }
        });

        if (error) {
          console.error('Error calling wallet transactions function:', error);
          throw error;
        }

        if (!data?.success) {
          console.error('Wallet transactions function returned error:', data?.error);
          throw new Error(data?.error || 'Failed to fetch transactions');
        }

        console.log('Client wallet transactions fetched via edge function:', data.data?.transactions?.length || 0, 'transactions');
        return data.data?.transactions || [];
      } catch (error) {
        console.error('Error fetching client wallet transactions:', error);
        throw error;
      }
    },
    enabled: !!client?.id,
    refetchInterval: 30000, // Reduced frequency since we're using edge function
  });

  // Set up real-time subscription for wallet transactions
  useEffect(() => {
    if (!client?.id) return;

    console.log('Setting up real-time subscription for client wallet transactions');

    const channel = supabase
      .channel(`client_wallet_transactions_${client.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `client_id=eq.${client.id}`
        },
        (payload) => {
          console.log('Real-time client wallet transaction update:', payload);
          queryClient.invalidateQueries({ queryKey: ['client-wallet-transactions', client.id] });
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Client wallet transactions subscription status:', status);
      });

    return () => {
      console.log('Cleaning up client wallet transactions subscription');
      supabase.removeChannel(channel);
    };
  }, [client?.id, queryClient, refetch]);

  return {
    transactions,
    isLoading,
    error,
    refetch,
  };
};
