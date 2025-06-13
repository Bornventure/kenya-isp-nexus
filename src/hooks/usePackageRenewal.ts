
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PackageRenewalRequest {
  client_email: string;
  client_id_number: string;
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

      if (error) {
        console.error('Package renewal error:', error);
        toast({
          title: "Renewal Failed",
          description: "Failed to initiate package renewal. Please try again.",
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
        toast({
          title: "Renewal Failed",
          description: data.error || "Failed to initiate renewal.",
          variant: "destructive",
        });
        return null;
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
