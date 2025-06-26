
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export const useMpesa = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const initiateSTKPush = async (request: STKPushRequest): Promise<STKPushResponse | null> => {
    setIsLoading(true);
    
    try {
      console.log('Initiating STK Push:', request);
      
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: request.phoneNumber,
          amount: request.amount,
          account_reference: request.accountReference,
          transaction_description: request.transactionDesc,
        },
      });

      if (error) {
        console.error('STK Push error:', error);
        toast({
          title: "Payment Error",
          description: error.message || "Failed to initiate payment. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      console.log('STK Push response:', data);

      if (data?.ResponseCode === '0') {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for the M-Pesa payment prompt.",
        });
        return data as STKPushResponse;
      } else {
        toast({
          title: "Payment Failed",
          description: data?.ResponseDescription || "Failed to initiate payment.",
          variant: "destructive",
        });
        return null;
      }
    } catch (err) {
      console.error('STK Push error:', err);
      toast({
        title: "Payment Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    initiateSTKPush,
    isLoading,
  };
};
