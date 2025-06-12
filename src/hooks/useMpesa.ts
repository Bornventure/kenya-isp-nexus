
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface QueryStatusResponse {
  ResponseCode: string;
  ResponseDescription: string;
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode?: string;
  ResultDesc?: string;
}

export const useMpesa = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateSTKPush = async (request: STKPushRequest): Promise<STKPushResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: request,
      });

      if (error) {
        console.error('STK Push error:', error);
        toast({
          title: "Payment Error",
          description: "Failed to initiate M-Pesa payment. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      if (data.ResponseCode === '0') {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for M-Pesa prompt.",
        });
        return data;
      } else {
        toast({
          title: "Payment Failed",
          description: data.ResponseDescription || "Failed to initiate payment.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('STK Push error:', error);
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const queryPaymentStatus = async (checkoutRequestID: string): Promise<QueryStatusResponse | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mpesa-query-status', {
        body: { checkoutRequestID },
      });

      if (error) {
        console.error('Query status error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Query status error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateSTKPush,
    queryPaymentStatus,
    isLoading,
  };
};
