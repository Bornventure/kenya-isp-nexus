
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMpesaCallback = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  const registerCallbackUrl = async () => {
    setIsRegistering(true);
    try {
      console.log('Registering M-Pesa callback URL...');

      const { data, error } = await supabase.functions.invoke('mpesa-register-callback');

      if (error) {
        console.error('Callback registration error:', error);
        toast({
          title: "Registration Failed",
          description: `Failed to register M-Pesa callback: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      if (data?.success) {
        toast({
          title: "Callback Registered",
          description: "M-Pesa callback URL has been registered successfully.",
        });
        console.log('Callback registration successful:', data);
        return data;
      } else {
        toast({
          title: "Registration Failed",
          description: data?.error || "Failed to register M-Pesa callback.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error('Callback registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred during callback registration.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registerCallbackUrl,
    isRegistering,
  };
};
