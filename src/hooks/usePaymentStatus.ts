
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
    callbacks: PaymentStatusCallbacks
  ) => {
    console.log('Starting payment monitoring for:', { invoiceId, checkoutRequestId });
    
    setIsMonitoring(true);
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes maximum
    
    const checkPaymentStatus = async () => {
      attempts++;
      console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: { 
            checkoutRequestId: checkoutRequestId, // Use camelCase to match the function expectation
            invoice_id: invoiceId
          }
        });

        if (error) {
          console.error('Payment status check error:', error);
          return;
        }

        console.log('Payment status response:', data);

        if (data?.success) {
          if (data.status === 'completed') {
            console.log('Payment confirmed successful!');
            setIsMonitoring(false);
            
            // Process the payment to update wallet and create records
            await processPaymentSuccess(data.client_id, data.amount, checkoutRequestId, data.mpesa_receipt_number);
            
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
        throw error;
      }

      console.log('Payment processed successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to process payment:', error);
      throw error;
    }
  };

  return {
    startPaymentMonitoring,
    isMonitoring
  };
};
