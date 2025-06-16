
import { useCallback } from 'react';
import { snmpService } from '@/services/snmpService';
import { useToast } from '@/hooks/use-toast';

export const useNetworkManagement = () => {
  const { toast } = useToast();

  const disconnectClient = useCallback(async (clientId: string) => {
    try {
      const success = await snmpService.disconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Disconnected",
          description: "Network access has been revoked due to suspended status.",
        });
      } else {
        toast({
          title: "Disconnection Failed",
          description: "Unable to disconnect client from network.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast({
        title: "Network Error",
        description: "Failed to communicate with network equipment.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const reconnectClient = useCallback(async (clientId: string) => {
    try {
      const success = await snmpService.reconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Reconnected", 
          description: "Network access has been restored.",
        });
      } else {
        toast({
          title: "Reconnection Failed",
          description: "Unable to reconnect client to network.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast({
        title: "Network Error",
        description: "Failed to communicate with network equipment.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    disconnectClient,
    reconnectClient
  };
};
