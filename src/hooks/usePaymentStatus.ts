
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PaymentStatusData {
  success: boolean;
  status: 'pending' | 'completed' | 'failed' | 'error';
  message: string;
  mpesaResponse?: any;
}

export const usePaymentStatus = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkPaymentStatus = async (
    paymentId: string, 
    checkoutRequestId: string,
    onSuccess?: (data: PaymentStatusData) => void,
    onFailure?: (data: PaymentStatusData) => void
  ): Promise<PaymentStatusData | null> => {
    setIsChecking(true);
    
    try {
      console.log('Checking payment status for:', { paymentId, checkoutRequestId });

      const { data, error } = await supabase.functions.invoke('check-payment-status', {
        body: {
          paymentId,
          checkoutRequestId
        }
      });

      console.log('Payment status response:', data);

      if (error) {
        console.error('Payment status check error:', error);
        toast({
          title: "Status Check Failed",
          description: "Failed to check payment status. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      const statusData: PaymentStatusData = {
        success: data.success,
        status: data.status,
        message: data.message,
        mpesaResponse: data.mpesaResponse
      };

      // Handle different status outcomes
      if (statusData.status === 'completed') {
        toast({
          title: "Payment Successful!",
          description: statusData.message,
        });
        if (onSuccess) onSuccess(statusData);
      } else if (statusData.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: statusData.message,
          variant: "destructive",
        });
        if (onFailure) onFailure(statusData);
      } else if (statusData.status === 'pending') {
        console.log('Payment still pending, will check again...');
      }

      return statusData;
    } catch (error) {
      console.error('Payment status check error:', error);
      toast({
        title: "Status Check Error",
        description: "An unexpected error occurred while checking payment status.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsChecking(false);
    }
  };

  const startPaymentMonitoring = (
    paymentId: string,
    checkoutRequestId: string,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      onSuccess?: (data: PaymentStatusData) => void;
      onFailure?: (data: PaymentStatusData) => void;
      onTimeout?: () => void;
    } = {}
  ) => {
    const {
      maxAttempts = 20,
      intervalMs = 10000,
      onSuccess,
      onFailure,
      onTimeout
    } = options;

    let attempts = 0;
    
    const checkStatus = async () => {
      attempts++;
      console.log(`Payment check attempt ${attempts}/${maxAttempts}`);
      
      const result = await checkPaymentStatus(paymentId, checkoutRequestId, onSuccess, onFailure);
      
      if (result?.status === 'completed' || result?.status === 'failed') {
        return; // Stop monitoring
      }
      
      if (attempts < maxAttempts) {
        setTimeout(checkStatus, intervalMs);
      } else {
        console.log('Payment monitoring timeout reached');
        toast({
          title: "Payment Status Unknown",
          description: "Payment status check timed out. Please check your account or contact support.",
          variant: "destructive",
        });
        if (onTimeout) onTimeout();
      }
    };

    // Start monitoring after initial delay
    setTimeout(checkStatus, 5000); // Wait 5 seconds before first check
  };

  return {
    checkPaymentStatus,
    startPaymentMonitoring,
    isChecking
  };
};
