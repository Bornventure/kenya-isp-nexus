

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusCallbacks {
  onSuccess?: (data: any) => void;
  onFailure?: (data: any) => void;
  onTimeout?: () => void;
}

export const usePaymentStatus = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const startPaymentMonitoring = useCallback(async (
    invoiceId: string,
    checkoutRequestId: string,
    callbacks: PaymentStatusCallbacks,
    clientId?: string,
    amount?: number
  ) => {
    console.log('Starting payment monitoring for:', { invoiceId, checkoutRequestId, clientId, amount });
    
    setIsMonitoring(true);
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes maximum
    
    const checkPaymentStatus = async () => {
      attempts++;
      console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: { 
            checkoutRequestId: checkoutRequestId,
            invoice_id: invoiceId,
            paymentId: invoiceId
          }
        });

        if (error) {
          console.error('Payment status check error:', error);
          
          // If this is an early attempt and we get an error, continue trying
          if (attempts < 5) {
            console.log('Early attempt failed, continuing...');
            if (attempts < maxAttempts) {
              setTimeout(checkPaymentStatus, 10000);
            }
            return;
          }
          
          // After several attempts, treat as still pending
          console.log('Multiple attempts failed, treating as pending...');
          if (attempts < maxAttempts) {
            setTimeout(checkPaymentStatus, 10000);
          } else {
            setIsMonitoring(false);
            if (callbacks.onTimeout) {
              callbacks.onTimeout();
            }
          }
          return;
        }

        console.log('Payment status response:', data);

        if (data?.success) {
          if (data.status === 'completed') {
            console.log('Payment confirmed successful!');
            setIsMonitoring(false);
            
            // Process the payment to update wallet and create records
            await processPaymentSuccess(
              data.data?.client_id || clientId, 
              data.data?.amount || amount, 
              checkoutRequestId, 
              data.data?.mpesa_receipt || data.mpesa_receipt_number
            );
            
            if (callbacks.onSuccess) {
              callbacks.onSuccess(data);
            }
            return;
          } else if (data.status === 'failed') {
            console.log('Payment failed:', data.message);
            setIsMonitoring(false);
            if (callbacks.onFailure) {
              callbacks.onFailure(data);
            }
            return;
          }
        }

        console.log('Payment still pending, continuing to monitor...');
        
        if (attempts < maxAttempts) {
          setTimeout(checkPaymentStatus, 10000); // Check every 10 seconds
        } else {
          console.log('Payment monitoring timeout');
          setIsMonitoring(false);
          if (callbacks.onTimeout) {
            callbacks.onTimeout();
          }
        }
      } catch (error) {
        console.error('Payment status check error:', error);
        
        // For network errors or other issues, continue trying for a while
        if (attempts < maxAttempts) {
          setTimeout(checkPaymentStatus, 10000);
        } else {
          setIsMonitoring(false);
          if (callbacks.onTimeout) {
            callbacks.onTimeout();
          }
        }
      }
    };

    // Start checking immediately
    checkPaymentStatus();
  }, [toast]);

  const processPaymentSuccess = async (
    clientId: string,
    amount: number,
    checkoutRequestId: string,
    mpesaReceiptNumber?: string
  ) => {
    if (!clientId || !amount) {
      console.error('Missing clientId or amount for payment processing:', { clientId, amount });
      toast({
        title: "Payment Error",
        description: "Missing payment information. Please contact support.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Processing payment success:', { clientId, amount, checkoutRequestId, mpesaReceiptNumber });
      
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: {
          checkoutRequestId,
          clientId,
          amount,
          paymentMethod: 'mpesa',
          mpesaReceiptNumber
        }
      });

      if (error) {
        console.error('Payment processing error:', error);
        toast({
          title: "Payment Processing Error",
          description: "Payment was successful but there was an issue updating your account. Please contact support if your balance doesn't reflect the payment.",
          variant: "destructive",
        });
        throw error;
      }

      if (!data?.success) {
        console.error('Payment processing failed:', data);
        toast({
          title: "Payment Processing Failed",
          description: data?.error || "There was an issue processing your payment. Please contact support.",
          variant: "destructive",
        });
        throw new Error(data?.error || 'Payment processing failed');
      }

      console.log('Payment processed successfully:', data);
      
      toast({
        title: "Payment Successful",
        description: `Your payment of KES ${amount} has been processed successfully. Your wallet has been updated.`,
      });
      
      return data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      
      // Don't show duplicate toasts if we already showed one above
      if (error.message !== 'Payment processing failed') {
        toast({
          title: "Payment Processing Error",
          description: "There was an unexpected error processing your payment. Please check your wallet balance or contact support.",
          variant: "destructive",
        });
      }
      
      throw error;
    }
  };

  return {
    startPaymentMonitoring,
    isMonitoring
  };
};
