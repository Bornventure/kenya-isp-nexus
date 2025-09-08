
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useNetworkManagement = () => {
  const { toast } = useToast();
  const { profile } = useAuth();

  const disconnectClient = useCallback(async (clientId: string): Promise<boolean> => {
    try {
      console.log(`Disconnecting client: ${clientId}`);
      
      if (!profile?.isp_company_id) {
        console.error('No company ID available');
        return false;
      }
      
      // Use the new network automation function
      const { data, error } = await supabase.functions.invoke('network-automation', {
        body: {
          action: 'disconnect_client',
          client_id: clientId,
          company_id: profile.isp_company_id
        }
      });

      if (error) {
        console.error('Network automation error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Client Disconnected",
          description: "Client has been successfully disconnected from the network.",
          variant: "destructive",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect client. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, profile?.isp_company_id]);

  const reconnectClient = useCallback(async (clientId: string): Promise<boolean> => {
    try {
      console.log(`Reconnecting client: ${clientId}`);
      
      if (!profile?.isp_company_id) {
        console.error('No company ID available');
        return false;
      }
      
      // Use the new network automation function
      const { data, error } = await supabase.functions.invoke('network-automation', {
        body: {
          action: 'connect_client',
          client_id: clientId,
          company_id: profile.isp_company_id
        }
      });

      if (error) {
        console.error('Network automation error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Client Reconnected",
          description: "Client has been successfully reconnected to the network.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast({
        title: "Reconnect Failed",
        description: "Failed to reconnect client. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, profile?.isp_company_id]);

  const applySpeedLimit = useCallback(async (clientId: string, packageId: string): Promise<boolean> => {
    try {
      console.log(`Applying speed limit for client: ${clientId}, package: ${packageId}`);
      
      if (!profile?.isp_company_id) {
        console.error('No company ID available');
        return false;
      }
      
      // Use the new network automation function
      const { data, error } = await supabase.functions.invoke('network-automation', {
        body: {
          action: 'update_qos',
          client_id: clientId,
          company_id: profile.isp_company_id
        }
      });

      if (error) {
        console.error('Network automation error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        toast({
          title: "Speed Limit Applied",
          description: "Speed limit has been successfully applied to the client.",
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      toast({
        title: "Speed Limit Failed",
        description: "Failed to apply speed limit. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, profile?.isp_company_id]);

  return {
    disconnectClient,
    reconnectClient,
    applySpeedLimit,
  };
};
