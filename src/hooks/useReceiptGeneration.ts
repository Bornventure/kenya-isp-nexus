
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Receipt } from '@/types/receipt';

export const useReceiptGeneration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateReceiptMutation = useMutation({
    mutationFn: async ({ 
      paymentId, 
      invoiceId, 
      clientId, 
      amount, 
      paymentMethod, 
      paymentReference 
    }: {
      paymentId: string;
      invoiceId: string;
      clientId: string;
      amount: number;
      paymentMethod: string;
      paymentReference: string;
    }) => {
      // Get client and invoice details
      const { data: client } = await supabase
        .from('clients')
        .select('name, email')
        .eq('id', clientId)
        .single();

      const { data: invoice } = await supabase
        .from('invoices')
        .select('invoice_number, service_period_start, service_period_end')
        .eq('id', invoiceId)
        .single();

      // Generate receipt number
      const receiptNumber = `RCP-${Date.now()}`;

      const receipt: Receipt = {
        id: paymentId,
        invoiceId: invoice?.invoice_number || invoiceId,
        clientId,
        clientName: client?.name || 'Unknown Client',
        clientEmail: client?.email || '',
        amount,
        paymentMethod: paymentMethod as any,
        paymentReference,
        dateCreated: new Date().toISOString(),
        datePaid: new Date().toISOString(),
        servicePackage: 'Internet Service',
        servicePeriod: {
          from: invoice?.service_period_start || new Date().toISOString(),
          to: invoice?.service_period_end || new Date().toISOString(),
        },
        status: 'generated',
        receiptNumber,
      };

      // In a real implementation, you would save this to a receipts table
      // For now, we'll just return the receipt object
      return receipt;
    },
    onSuccess: (receipt) => {
      toast({
        title: "Receipt Generated",
        description: `Receipt ${receipt.receiptNumber} has been automatically generated.`,
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['receipts'] });
    },
    onError: (error) => {
      console.error('Error generating receipt:', error);
      toast({
        title: "Receipt Generation Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    generateReceipt: generateReceiptMutation.mutate,
    isGenerating: generateReceiptMutation.isPending,
  };
};
