
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
    timeoutMs: number = 120000 // 2 minutes
  ) => {
    console.log('Starting payment monitoring for:', { paymentId, checkoutRequestId });
    setIsMonitoring(true);

    let attempts = 0;
    const maxAttempts = 24; // 2 minutes with 5-second intervals

    const checkStatus = async () => {
      attempts++;
      console.log(`Payment status check attempt ${attempts}/${maxAttempts}`);

      try {
        const { data, error } = await supabase.functions.invoke('mpesa-query-status', {
          body: {
            checkout_request_id: checkoutRequestId,
          },
        });

        if (error) {
          console.error('Payment status check error:', error);
          return;
        }

        console.log('Payment status response:', data);

        if (data?.ResultCode === '0') {
          // Payment successful
          console.log('Payment successful!');
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onSuccess(data);
          return;
        } else if (data?.ResultCode && data.ResultCode !== '1032') {
          // Payment failed (not pending)
          console.log('Payment failed with code:', data.ResultCode);
          clearMonitoring();
          setIsMonitoring(false);
          callbacks.onFailure(data);
          return;
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

    // Start checking immediately, then every 5 seconds
    checkStatus();
    intervalRef.current = setInterval(checkStatus, 5000);

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
