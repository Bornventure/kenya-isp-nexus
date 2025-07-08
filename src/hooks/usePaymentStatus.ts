
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentStatusCallbacks {
  onSuccess: (data: any) => void;
  onFailure: (data: any) => void;
  onTimeout: () => void;
}

export const usePaymentStatus = () => {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const intervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  const startPaymentMonitoring = (
    paymentId: string,
    checkoutRequestId: string,
    callbacks: PaymentStatusCallbacks,
    timeoutMs: number = 300000 // 5 minutes timeout
  ) => {
    console.log('Starting payment monitoring for:', { paymentId, checkoutRequestId });
    setIsMonitoring(true);

    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const checkStatus = async () => {
      attempts++;
      console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);

      try {
        const { data, error } = await supabase.functions.invoke('check-payment-status', {
          body: {
            checkout_request_id: checkoutRequestId,
            paymentId: paymentId,
            checkoutRequestId: checkoutRequestId,
          },
        });

        if (error) {
          console.error('Payment status check error:', error);
          // Don't return immediately, continue checking unless it's a fatal error
          if (attempts >= maxAttempts) {
            clearMonitoring();
            setIsMonitoring(false);
            callbacks.onTimeout();
          }
          return;
        }

        console.log('Payment status response:', data);

        if (data?.status === 'completed' && data?.success) {
          // Payment successful
          console.log('Payment confirmed successful!');
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onSuccess(data);
          return;
        } else if (data?.status === 'failed') {
          // Payment failed
          console.log('Payment failed:', data?.message);
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onFailure(data);
          return;
        } else if (data?.status === 'pending') {
          // Payment still pending, continue monitoring
          console.log('Payment still pending, continuing to monitor...');
        } else {
          // Unknown status
          console.log('Unknown payment status:', data);
        }

        // Continue monitoring if still pending or no definitive result
        if (attempts >= maxAttempts) {
          console.log('Payment monitoring timeout reached');
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onTimeout();
        }
      } catch (err) {
        console.error('Payment status check error:', err);
        if (attempts >= maxAttempts) {
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onTimeout();
        }
      }
    };

    // Start checking after 3 seconds to allow M-Pesa to process, then every 5 seconds
    setTimeout(() => {
      checkStatus();
      intervalRef.current = setInterval(checkStatus, 5000);
    }, 3000);

    // Set overall timeout
    timeoutRef.current = setTimeout(() => {
      console.log('Payment monitoring overall timeout');
      clearMonitoring();
      setIsMonitoring(false);
      callbacks.onTimeout();
    }, timeoutMs);
  };

  const clearMonitoring = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const stopMonitoring = () => {
    clearMonitoring();
    setIsMonitoring(false);
  };

  return {
    startPaymentMonitoring,
    stopMonitoring,
    isMonitoring,
  };
};
