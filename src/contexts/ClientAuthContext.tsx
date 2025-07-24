
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClientData {
  id: string;
  name: string;
  email: string;
  phone: string;
  mpesa_number: string;
  id_number: string;
  status: string;
  wallet_balance: number;
  monthly_rate: number;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  subscription_type: string;
  installation_date: string | null;
  location: {
    address: string;
    county: string;
    sub_county: string;
  };
  service_package: any;
  payment_settings: {
    paybill_number: string;
    account_number: string;
  };
  wallet_transactions?: Array<{
    id: string;
    transaction_type: 'credit' | 'debit';
    amount: number;
    description: string;
    created_at: string;
    mpesa_receipt_number?: string;
  }>;
}

interface ClientAuthContextType {
  client: ClientData | null;
  isLoading: boolean;
  login: (email: string, idNumber: string) => Promise<boolean>;
  logout: () => void;
  refreshClientData: () => Promise<void>;
}

const ClientAuthContext = createContext<ClientAuthContextType | undefined>(undefined);

export function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const storedClient = localStorage.getItem('clientData');
    if (storedClient) {
      try {
        setClient(JSON.parse(storedClient));
      } catch (error) {
        console.error('Error parsing stored client data:', error);
        localStorage.removeItem('clientData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, idNumber: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('client-auth', {
        body: { email, id_number: idNumber }
      });

      if (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Edge Function returned a non-2xx status code')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or ID number. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: "Unable to connect to the server. Please try again later.",
            variant: "destructive",
          });
        }
        return false;
      }

      if (data?.success && data?.client) {
        setClient(data.client);
        localStorage.setItem('clientData', JSON.stringify(data.client));
        
        toast({
          title: "Login Successful",
          description: data.access_message || "Welcome to your client portal",
        });
        return true;
      }

      // Handle case where data exists but login was not successful
      const errorMessage = data?.error || "Invalid email or ID number";
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle network errors and other exceptions
      if (error instanceof Error) {
        if (error.message.includes('FunctionsHttpError')) {
          toast({
            title: "Login Failed",
            description: "Invalid email or ID number. Please check your credentials and try again.",
            variant: "destructive",
          });
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          toast({
            title: "Connection Error",
            description: "Unable to connect to the server. Please check your internet connection and try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: "An unexpected error occurred. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again later.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshClientData = async () => {
    if (!client) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('client-dashboard-data', {
        body: { 
          client_email: client.email,
          client_id_number: client.id_number 
        }
      });

      if (data?.success && data?.data?.client) {
        setClient(data.data.client);
        localStorage.setItem('clientData', JSON.stringify(data.data.client));
      }
    } catch (error) {
      console.error('Error refreshing client data:', error);
    }
  };

  const logout = () => {
    setClient(null);
    localStorage.removeItem('clientData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    client,
    isLoading,
    login,
    logout,
    refreshClientData,
  };

  return (
    <ClientAuthContext.Provider value={value}>
      {children}
    </ClientAuthContext.Provider>
  );
}

export function useClientAuth() {
  const context = useContext(ClientAuthContext);
  if (context === undefined) {
    throw new Error('useClientAuth must be used within a ClientAuthProvider');
  }
  return context;
}
