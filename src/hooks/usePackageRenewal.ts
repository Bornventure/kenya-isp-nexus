
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  };
  error?: string;
  code?: string;
}

export const usePackageRenewal = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
          title: "Renewal Initiated",
          description: "Please check your phone for M-Pesa payment prompt.",
        });
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
        return data; // Return the error response so caller can handle it
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
  };
};
