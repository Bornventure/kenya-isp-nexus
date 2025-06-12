
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  client_id: string;
  invoice_id: string | null;
  amount: number;
  payment_method: 'mpesa' | 'bank' | 'cash';
  payment_date: string;
  reference_number: string | null;
  mpesa_receipt_number: string | null;
  notes: string | null;
  isp_company_id: string;
  created_at: string;
  clients?: {
    name: string;
    email: string;
  };
}

export const usePayments = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading, error } = useQuery({
    queryKey: ['payments', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          clients (
            name,
            email
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('payment_date', { ascending: false });

      if (error) {
        console.error('Error fetching payments:', error);
        throw error;
      }

      return data as Payment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Get current client balance first
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('balance')
        .eq('id', paymentData.client_id)
        .single();

      if (clientError) {
        console.error('Error fetching client balance:', clientError);
      } else {
        // Update client balance by adding the payment amount
        const newBalance = (client.balance || 0) + paymentData.amount;
        const { error: balanceError } = await supabase
          .from('clients')
          .update({ balance: newBalance })
          .eq('id', paymentData.client_id);

        if (balanceError) {
          console.error('Error updating client balance:', balanceError);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Payment Recorded",
        description: "Payment has been successfully recorded.",
      });
    },
    onError: (error) => {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    payments,
    isLoading,
    error,
    createPayment: createPaymentMutation.mutate,
    isCreating: createPaymentMutation.isPending,
  };
};
