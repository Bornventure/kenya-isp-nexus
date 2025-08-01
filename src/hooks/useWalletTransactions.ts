
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WalletTransaction {
  id: string;
  client_id: string;
  transaction_type: 'credit' | 'debit' | 'payment' | 'refund';
  amount: number;
  description: string | null;
  reference_number: string | null;
  mpesa_receipt_number: string | null;
  created_at: string;
  isp_company_id: string;
  clients?: {
    name: string;
    email: string;
  };
}

export const useWalletTransactions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['wallet-transactions', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching wallet transactions:', error);
        throw error;
      }

      console.log('Wallet transactions fetched:', data);
      return data as WalletTransaction[];
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 5000, // Refetch every 5 seconds to show new transactions
  });

  const creditWalletMutation = useMutation({
    mutationFn: async (creditData: {
      client_id: string;
      amount: number;
      payment_method: 'mpesa' | 'bank' | 'cash';
      reference_number: string;
      mpesa_receipt_number?: string;
      description?: string;
    }) => {
      console.log('Processing wallet credit:', creditData);

      const { data, error } = await supabase.functions.invoke('wallet-credit', {
        body: creditData,
      });

      if (error) throw error;

      // Send payment success notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: creditData.client_id,
            type: 'payment_success',
            data: {
              amount: creditData.amount,
              receipt_number: creditData.mpesa_receipt_number || creditData.reference_number,
              payment_method: creditData.payment_method,
              new_balance: data?.data?.new_balance,
              auto_renewed: data?.data?.auto_renewed
            }
          }
        });
        console.log('Wallet credit notification sent');
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      // Generate receipt for wallet credit
      try {
        const { data: clientData } = await supabase
          .from('clients')
          .select('email, id_number')
          .eq('id', creditData.client_id)
          .single();

        if (clientData) {
          const { data: receiptData, error: receiptError } = await supabase.functions.invoke('generate-receipt', {
            body: {
              client_email: clientData.email,
              client_id_number: clientData.id_number,
              payment_id: null, // No payment record for direct wallet credits
              invoice_id: null,
              amount: creditData.amount,
              payment_method: creditData.payment_method,
              reference_number: creditData.reference_number,
              description: creditData.description || 'Wallet credit'
            }
          });
          
          if (!receiptError) {
            console.log('Wallet credit receipt generated successfully');
          }
        }
      } catch (receiptError) {
        console.error('Error generating receipt:', receiptError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['client-dashboard'] });
      refetch(); // Force immediate refetch
      toast({
        title: "Wallet Credited",
        description: "Client wallet has been credited and account updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error crediting wallet:', error);
      toast({
        title: "Error",
        description: "Failed to credit wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    error,
    creditWallet: creditWalletMutation.mutate,
    isCrediting: creditWalletMutation.isPending,
    refetch,
  };
};
