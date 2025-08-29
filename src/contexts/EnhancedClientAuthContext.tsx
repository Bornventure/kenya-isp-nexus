
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
  service_activated_at: string | null;
  location: {
    address: string;
    county: string;
    sub_county: string;
  };
  service_package: any;
  portal_setup_required: boolean;
  connection_status: 'connected' | 'disconnected' | 'suspended';
  current_session?: {
    session_start: string;
    data_used_mb: number;
    session_duration_minutes: number;
    ip_address: string;
  };
}

interface EnhancedClientAuthContextType {
  client: ClientData | null;
  isLoading: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'suspended';
  login: (email: string, password: string) => Promise<boolean>;
  changePassword: (newPassword: string) => Promise<boolean>;
  logout: () => void;
  refreshClientData: () => Promise<void>;
  refreshConnectionStatus: () => Promise<void>;
}

const EnhancedClientAuthContext = createContext<EnhancedClientAuthContextType | undefined>(undefined);

export function EnhancedClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'suspended'>('disconnected');
  const { toast } = useToast();

  useEffect(() => {
    const storedClient = localStorage.getItem('enhancedClientData');
    if (storedClient) {
      try {
        const parsedClient = JSON.parse(storedClient);
        setClient(parsedClient);
        refreshConnectionStatus();
      } catch (error) {
        console.error('Error parsing stored client data:', error);
        localStorage.removeItem('enhancedClientData');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Enhanced login with portal password support
      const { data, error } = await supabase.functions.invoke('enhanced-client-auth', {
        body: { email, password, login_type: 'portal' }
      });

      if (error || !data?.success) {
        toast({
          title: "Login Failed",
          description: data?.error || "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }

      if (data.client) {
        const enhancedClient = await enrichClientData(data.client);
        setClient(enhancedClient);
        localStorage.setItem('enhancedClientData', JSON.stringify(enhancedClient));
        
        // Refresh connection status after login
        await refreshConnectionStatus();
        
        toast({
          title: "Login Successful",
          description: data.client.portal_setup_required 
            ? "Welcome! Please change your temporary password." 
            : "Welcome back to your client portal",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (newPassword: string): Promise<boolean> => {
    if (!client) return false;

    try {
      const { data, error } = await supabase.functions.invoke('update-client-password', {
        body: { 
          client_id: client.id, 
          new_password: newPassword 
        }
      });

      if (error || !data?.success) {
        toast({
          title: "Password Update Failed",
          description: data?.error || "Failed to update password",
          variant: "destructive",
        });
        return false;
      }

      // Update client data to reflect password change
      const updatedClient = { ...client, portal_setup_required: false };
      setClient(updatedClient);
      localStorage.setItem('enhancedClientData', JSON.stringify(updatedClient));

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: "Password Update Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshConnectionStatus = async () => {
    if (!client) return;

    try {
      // Check active session from RADIUS/MikroTik data
      const { data: sessions } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('client_id', client.id)
        .order('session_start', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setConnectionStatus('connected');
        // Update client data with current session info
        const sessionData = sessions[0];
        const updatedClient = {
          ...client,
          current_session: {
            session_start: sessionData.session_start,
            data_used_mb: 0, // Will be populated from bandwidth_statistics
            session_duration_minutes: Math.floor((new Date().getTime() - new Date(sessionData.session_start).getTime()) / (1000 * 60)),
            ip_address: sessionData.framed_ip_address || 'N/A'
          }
        };
        setClient(updatedClient);
      } else {
        // Check if client is suspended
        if (client.status === 'suspended') {
          setConnectionStatus('suspended');
        } else {
          setConnectionStatus('disconnected');
        }
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setConnectionStatus('disconnected');
    }
  };

  const enrichClientData = async (baseClient: any): Promise<ClientData> => {
    // Get current session data
    const { data: sessions } = await supabase
      .from('active_sessions')
      .select('*')
      .eq('client_id', baseClient.id)
      .order('session_start', { ascending: false })
      .limit(1);

    const currentSession = sessions && sessions.length > 0 ? {
      session_start: sessions[0].session_start,
      data_used_mb: 0,
      session_duration_minutes: Math.floor((new Date().getTime() - new Date(sessions[0].session_start).getTime()) / (1000 * 60)),
      ip_address: sessions[0].framed_ip_address || 'N/A'
    } : undefined;

    return {
      ...baseClient,
      location: {
        address: baseClient.address,
        county: baseClient.county,
        sub_county: baseClient.sub_county,
      },
      connection_status: sessions && sessions.length > 0 ? 'connected' : 
                        baseClient.status === 'suspended' ? 'suspended' : 'disconnected',
      current_session: currentSession
    };
  };

  const refreshClientData = async () => {
    if (!client) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-enhanced-client-data', {
        body: { client_id: client.id }
      });

      if (data?.success && data?.client) {
        const enhancedClient = await enrichClientData(data.client);
        setClient(enhancedClient);
        localStorage.setItem('enhancedClientData', JSON.stringify(enhancedClient));
        await refreshConnectionStatus();
      }
    } catch (error) {
      console.error('Error refreshing client data:', error);
    }
  };

  const logout = () => {
    setClient(null);
    setConnectionStatus('disconnected');
    localStorage.removeItem('enhancedClientData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    client,
    isLoading,
    connectionStatus,
    login,
    changePassword,
    logout,
    refreshClientData,
    refreshConnectionStatus,
  };

  return (
    <EnhancedClientAuthContext.Provider value={value}>
      {children}
    </EnhancedClientAuthContext.Provider>
  );
}

export function useEnhancedClientAuth() {
  const context = useContext(EnhancedClientAuthContext);
  if (context === undefined) {
    throw new Error('useEnhancedClientAuth must be used within an EnhancedClientAuthProvider');
  }
  return context;
}
