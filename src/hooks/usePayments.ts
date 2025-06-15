
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

interface WalletCreditResponse {
  success: boolean;
  data?: {
    new_balance: number;
    auto_renewed: boolean;
  };
  error?: string;
}

interface RenewalResponse {
  success: boolean;
  message?: string;
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

      console.log('Processing manual payment:', paymentData);

      // Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (paymentError) throw paymentError;
      console.log('Payment record created:', payment.id);

      // If there's an associated invoice, update it to paid
      if (paymentData.invoice_id) {
        const { error: invoiceUpdateError } = await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', paymentData.invoice_id);

        if (invoiceUpdateError) {
          console.error('Error updating invoice status:', invoiceUpdateError);
        } else {
          console.log('Invoice marked as paid:', paymentData.invoice_id);
        }
      }

      // Credit the client's wallet
      console.log('Crediting wallet for client:', paymentData.client_id);
      const { data: walletCredit, error: walletError } = await supabase.functions.invoke('wallet-credit', {
        body: {
          client_id: paymentData.client_id,
          amount: paymentData.amount,
          payment_method: paymentData.payment_method,
          reference_number: paymentData.reference_number || `Manual-${Date.now()}`,
          mpesa_receipt_number: paymentData.mpesa_receipt_number,
          description: `Manual payment - ${paymentData.payment_method}`
        }
      });

      if (walletError) {
        console.error('Error crediting wallet:', walletError);
      } else {
        console.log('Wallet credited successfully:', walletCredit);
      }

      // Type assertion for wallet credit response
      const walletResponse = walletCredit as WalletCreditResponse;

      // Try to process subscription renewal
      console.log('Processing subscription renewal for client:', paymentData.client_id);
      const { data: renewalResult, error: renewalError } = await supabase.rpc('process_subscription_renewal', {
        p_client_id: paymentData.client_id
      });

      // Type assertion for renewal response
      const renewalResponse = renewalResult as RenewalResponse;

      if (!renewalError && renewalResponse?.success) {
        console.log('Subscription renewed successfully:', renewalResult);
      } else {
        console.log('Subscription renewal not needed or failed:', renewalResult);
        
        // If renewal failed but they paid, at least reactivate them temporarily
        await supabase
          .from('clients')
          .update({ 
            status: 'active',
            subscription_start_date: new Date().toISOString(),
            subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          })
          .eq('id', paymentData.client_id);
        
        console.log('Client reactivated manually');
      }

      // Send payment success notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: paymentData.client_id,
            type: 'payment_success',
            data: {
              amount: paymentData.amount,
              receipt_number: paymentData.mpesa_receipt_number || paymentData.reference_number,
              payment_method: paymentData.payment_method,
              new_balance: walletResponse?.data?.new_balance,
              auto_renewed: walletResponse?.data?.auto_renewed || renewalResponse?.success
            }
          }
        });
        console.log('Payment success notification sent');
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      // Generate receipt
      try {
        const { data: clientData } = await supabase
          .from('clients')
          .select('email, id_number')
          .eq('id', paymentData.client_id)
          .single();

        if (clientData) {
          const { data: receiptData, error: receiptError } = await supabase.functions.invoke('generate-receipt', {
            body: {
              client_email: clientData.email,
              client_id_number: clientData.id_number,
              payment_id: payment.id,
              invoice_id: paymentData.invoice_id
            }
          });
          
          if (!receiptError) {
            console.log('Receipt generated successfully');
          }
        }
      } catch (receiptError) {
        console.error('Error generating receipt:', receiptError);
      }

      return payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      toast({
        title: "Payment Processed",
        description: "Payment has been recorded and account updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
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
