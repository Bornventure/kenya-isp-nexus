
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { parseAmount } from '@/utils/currencyFormat';

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

      // Fix amount parsing issues
      return (data as Payment[]).map(payment => ({
        ...payment,
        amount: parseAmount(payment.amount)
      }));
    },
    enabled: !!profile?.isp_company_id,
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      console.log('Processing manual payment:', paymentData);

      // Use the comprehensive payment processor
      const { data: processResult, error: processError } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId: paymentData.reference_number || `MANUAL-${Date.now()}`,
          clientId: paymentData.client_id,
          amount: parseAmount(paymentData.amount),
          paymentMethod: paymentData.payment_method,
          mpesaReceiptNumber: paymentData.mpesa_receipt_number
        }
      });

      if (processError) {
        console.error('Error processing payment:', processError);
        throw new Error(`Payment processing failed: ${processError.message}`);
      }

      console.log('Payment processed successfully:', processResult);
      return processResult;
    },
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      
      toast({
        title: "Payment Processed",
        description: "Payment has been processed successfully with automatic subscription renewal and notifications sent.",
      });
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: `Failed to process payment: ${error.message}`,
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
