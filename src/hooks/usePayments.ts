
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  client_id?: string;
  amount: number;
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  mpesa_receipt_number?: string;
  status: string;
  invoice_id?: string;
  notes?: string;
  isp_company_id: string;
  created_at: string;
  clients?: {
    id: string;
    name: string;
    email?: string;
    phone: string;
  };
}

export const usePayments = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading, error, refetch } = useQuery({
    queryKey: ['payments', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      console.log('Fetching payments for company:', profile.isp_company_id);

      // Fetch from mpesa_payments table since it exists in the schema
      const { data: mpesaData, error: mpesaError } = await supabase
        .from('mpesa_payments')
        .select(`
          *,
          clients (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (mpesaError) {
        console.error('Error fetching M-Pesa payments:', mpesaError);
        throw mpesaError;
      }

      // Transform M-Pesa payments to Payment interface
      const transformedPayments: Payment[] = (mpesaData || []).map((payment: any) => ({
        id: payment.id,
        client_id: payment.client_id,
        amount: payment.trans_amount || payment.amount || 0,
        payment_method: 'M-Pesa',
        payment_date: payment.created_at,
        reference_number: payment.trans_id || payment.reference_number,
        mpesa_receipt_number: payment.receipt_number,
        status: payment.status || 'completed',
        invoice_id: payment.invoice_id,
        notes: payment.notes,
        isp_company_id: payment.isp_company_id,
        created_at: payment.created_at,
        clients: payment.clients
      }));

      console.log(`Fetched ${transformedPayments.length} payments for company ${profile.isp_company_id}`);
      return transformedPayments;
    },
    enabled: !!profile?.isp_company_id,
  });

  const recordPayment = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // Insert into mpesa_payments table since it exists
      const { data, error } = await supabase
        .from('mpesa_payments')
        .insert({
          client_id: paymentData.client_id,
          trans_amount: paymentData.amount,
          trans_id: paymentData.reference_number || `PAY-${Date.now()}`,
          receipt_number: paymentData.mpesa_receipt_number,
          status: 'completed',
          isp_company_id: profile.isp_company_id,
          notes: paymentData.notes,
          msisdn: '254700000000', // Default phone, should be updated with actual client phone
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error recording payment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to record payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    payments,
    isLoading,
    error,
    refetch,
    recordPayment: recordPayment.mutate,
    isRecording: recordPayment.isPending,
  };
};
