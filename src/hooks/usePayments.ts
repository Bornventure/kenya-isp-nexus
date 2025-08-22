
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

      // Fetch from family_bank_payments table which exists in the schema
      const { data: familyBankData, error: familyBankError } = await supabase
        .from('family_bank_payments')
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

      if (familyBankError) {
        console.error('Error fetching Family Bank payments:', familyBankError);
        throw familyBankError;
      }

      // Transform Family Bank payments to Payment interface
      const transformedPayments: Payment[] = (familyBankData || []).map((payment: any) => ({
        id: payment.id,
        client_id: payment.client_id,
        amount: payment.trans_amount || 0,
        payment_method: 'Family Bank',
        payment_date: payment.created_at,
        reference_number: payment.trans_id,
        mpesa_receipt_number: payment.third_party_trans_id,
        status: payment.status || 'completed',
        invoice_id: payment.invoice_number,
        notes: `Transaction: ${payment.transaction_type || 'Payment'}`,
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

      // Insert into family_bank_payments table
      const { data, error } = await supabase
        .from('family_bank_payments')
        .insert({
          client_id: paymentData.client_id,
          trans_amount: paymentData.amount,
          trans_id: paymentData.reference_number || `PAY-${Date.now()}`,
          third_party_trans_id: paymentData.mpesa_receipt_number,
          status: 'verified',
          isp_company_id: profile.isp_company_id,
          transaction_type: 'payment',
          msisdn: '254700000000', // Default phone, should be updated with actual client phone
          invoice_number: paymentData.invoice_id || null,
          first_name: 'Manual',
          last_name: 'Payment',
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
