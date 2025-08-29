
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { paymentActivationService } from '@/services/paymentActivationService';
import { supabase } from '@/integrations/supabase/client';

export const useEnhancedPaymentProcessing = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const processManualPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      clientId: string;
      amount: number;
      paymentMethod: 'cash' | 'bank_transfer' | 'cheque';
      referenceNumber: string;
      notes?: string;
    }) => {
      console.log('Processing manual payment:', paymentData);

      // 1. Create payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          client_id: paymentData.clientId,
          amount: paymentData.amount,
          payment_method: paymentData.paymentMethod,
          payment_date: new Date().toISOString(),
          reference_number: paymentData.referenceNumber,
          notes: paymentData.notes || `Manual ${paymentData.paymentMethod} payment`,
          isp_company_id: '' // Will be filled by RLS
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. Process activation
      const activationResult = await paymentActivationService.processPaymentActivation({
        clientId: paymentData.clientId,
        paymentId: payment.id,
        amount: paymentData.amount,
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber
      });

      return { payment, activationResult };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      
      if (data.activationResult.success) {
        toast({
          title: "Payment Processed & Client Activated",
          description: data.activationResult.message,
        });
      } else {
        toast({
          title: "Payment Processed",
          description: "Payment recorded but activation failed. Please check client status manually.",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const processMpesaPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      clientId: string;
      amount: number;
      phoneNumber: string;
      mpesaReceiptNumber: string;
      transactionId: string;
    }) => {
      console.log('Processing M-Pesa payment confirmation:', paymentData);

      // Process activation with M-Pesa details
      const activationResult = await paymentActivationService.processPaymentActivation({
        clientId: paymentData.clientId,
        paymentId: paymentData.transactionId,
        amount: paymentData.amount,
        paymentMethod: 'mpesa',
        referenceNumber: paymentData.transactionId,
        mpesaReceiptNumber: paymentData.mpesaReceiptNumber
      });

      return activationResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      
      toast({
        title: result.success ? "M-Pesa Payment Confirmed" : "Payment Confirmation Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      console.error('M-Pesa payment processing error:', error);
      toast({
        title: "M-Pesa Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process M-Pesa payment",
        variant: "destructive",
      });
    },
  });

  const processFamilyBankPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      clientId: string;
      amount: number;
      transactionId: string;
      thirdPartyTransId: string;
      phoneNumber: string;
    }) => {
      console.log('Processing Family Bank payment confirmation:', paymentData);

      // Process activation with Family Bank details
      const activationResult = await paymentActivationService.processPaymentActivation({
        clientId: paymentData.clientId,
        paymentId: paymentData.transactionId,
        amount: paymentData.amount,
        paymentMethod: 'family_bank',
        referenceNumber: paymentData.transactionId,
        mpesaReceiptNumber: paymentData.thirdPartyTransId
      });

      return activationResult;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['installation-invoices'] });
      
      toast({
        title: result.success ? "Family Bank Payment Confirmed" : "Payment Confirmation Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error) => {
      console.error('Family Bank payment processing error:', error);
      toast({
        title: "Family Bank Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process Family Bank payment",
        variant: "destructive",
      });
    },
  });

  return {
    processManualPayment: processManualPaymentMutation.mutate,
    isProcessingManual: processManualPaymentMutation.isPending,
    
    processMpesaPayment: processMpesaPaymentMutation.mutate,
    isProcessingMpesa: processMpesaPaymentMutation.isPending,
    
    processFamilyBankPayment: processFamilyBankPaymentMutation.mutate,
    isProcessingFamilyBank: processFamilyBankPaymentMutation.isPending,
  };
};
