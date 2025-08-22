
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

      // Try multiple payment tables
      const tables = ['mpesa_payments', 'family_bank_payments'];
      let allPayments: Payment[] = [];

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
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

          if (!error && data) {
            const transformedData = data.map(payment => ({
              ...payment,
              payment_date: payment.created_at,
              reference_number: payment.trans_id || payment.reference_number || payment.id,
              payment_method: table === 'mpesa_payments' ? 'M-Pesa' : 'Family Bank'
            }));
            allPayments = [...allPayments, ...transformedData];
          }
        } catch (err) {
          console.warn(`Error fetching from ${table}:`, err);
        }
      }

      console.log(`Fetched ${allPayments.length} payments for company ${profile.isp_company_id}`);
      return allPayments as Payment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const recordPayment = useMutation({
    mutationFn: async (paymentData: Omit<Payment, 'id' | 'created_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('mpesa_payments')
        .insert({
          ...paymentData,
          isp_company_id: profile.isp_company_id,
          trans_id: paymentData.reference_number,
          trans_amount: paymentData.amount,
          msisdn: '254700000000', // Default, should be updated with actual client phone
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
