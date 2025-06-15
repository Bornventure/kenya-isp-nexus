
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePaymentStatus } from './usePaymentStatus';

export interface PackageRenewalRequest {
  client_email: string;
  client_id_number?: string;
  mpesa_number?: string;
  package_id?: string;
}

export interface PackageRenewalResponse {
  success: boolean;
  data?: {
    invoice: {
      id: string;
      invoice_number: string;
      amount: number;
      due_date: string;
    };
    mpesa_response: any;
    client: {
      name: string;
      email: string;
      mpesa_number: string;
    };
    checkout_request_id: string;
  };
  error?: string;
  code?: string;
}

export const usePackageRenewal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { startPaymentMonitoring } = usePaymentStatus();

  const renewPackage = async (request: PackageRenewalRequest): Promise<PackageRenewalResponse | null> => {
    setIsLoading(true);
    try {
      console.log('Initiating package renewal:', request);

      const { data, error } = await supabase.functions.invoke('package-renewal', {
        body: request,
      });

      console.log('Package renewal response:', { data, error });

      if (error) {
        console.error('Supabase function invoke error:', error);
        toast({
          title: "Renewal Failed",
          description: `Network error: ${error.message || 'Failed to connect to server'}`,
          variant: "destructive",
        });
        return null;
      }

      if (!data) {
        console.error('No data received from package renewal function');
        toast({
          title: "Renewal Failed",
          description: "No response received from server",
          variant: "destructive",
        });
        return null;
      }

      if (data.success) {
        toast({
          title: "Payment Initiated",
          description: "Please check your phone for M-Pesa payment prompt.",
        });

        // Start monitoring payment status using the invoice ID and checkout request ID
        if (data.data?.checkout_request_id && data.data?.invoice?.id) {
          setIsProcessing(true);
          
          console.log('Starting payment monitoring for package renewal:', {
            invoiceId: data.data.invoice.id,
            checkoutRequestId: data.data.checkout_request_id
          });
          
          startPaymentMonitoring(
            data.data.invoice.id,
            data.data.checkout_request_id,
            {
              onSuccess: (statusData) => {
                setIsProcessing(false);
                toast({
                  title: "Renewal Successful!",
                  description: "Your package has been renewed and account activated.",
                });
                console.log('Package renewal payment successful:', statusData);
              },
              onFailure: (statusData) => {
                setIsProcessing(false);
                toast({
                  title: "Payment Failed",
                  description: statusData.message || "Payment was not completed successfully.",
                  variant: "destructive",
                });
                console.log('Package renewal payment failed:', statusData);
              },
              onTimeout: () => {
                setIsProcessing(false);
                toast({
                  title: "Payment Status Unknown",
                  description: "Please check your account status or contact support.",
                  variant: "destructive",
                });
                console.log('Package renewal payment monitoring timeout');
              }
            }
          );
        }

        return data;
      } else {
        console.error('Package renewal failed with error:', data.error, 'Code:', data.code);
        
        // Provide specific error messages based on error codes
        let errorMessage = data.error || "Failed to initiate renewal.";
        
        if (data.code === 'CLIENT_NOT_FOUND') {
          errorMessage = "Client not found. Please check your email and ID number.";
        } else if (data.code === 'MPESA_ERROR') {
          errorMessage = "Failed to initiate M-Pesa payment. Please try again or contact support.";
        } else if (data.code === 'MISSING_EMAIL') {
          errorMessage = "Email is required for package renewal.";
        }
        
        toast({
          title: "Renewal Failed",
          description: errorMessage,
          variant: "destructive",
        });
        return data;
      }
    } catch (error) {
      console.error('Package renewal error:', error);
      toast({
        title: "Renewal Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    renewPackage,
    isLoading,
    isProcessing
  };
};
