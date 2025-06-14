
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

  const { data: transactions = [], isLoading, error } = useQuery({
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

      return data as WalletTransaction[];
    },
    enabled: !!profile?.isp_company_id,
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
      const { data, error } = await supabase.functions.invoke('wallet-credit', {
        body: creditData,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Wallet Credited",
        description: "Client wallet has been successfully credited.",
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
  };
};
