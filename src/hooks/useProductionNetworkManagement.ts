
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useProductionNetworkManagement = () => {
  const { toast } = useToast();

  const disconnectClient = useCallback(async (clientId: string) => {
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const success = await enhancedSnmpService.disconnectClient(clientId);
      
      if (success) {
        toast({
          title: "Client Disconnected",
          description: "Client has been disconnected from all MikroTik devices and speed limits disabled.",
        });
      } else {
        toast({
          title: "Disconnection Failed",
          description: "Unable to disconnect client. Please check device connectivity.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error disconnecting client:', error);
      toast({
        title: "Network Error",
        description: "Failed to communicate with MikroTik devices.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const reconnectClient = useCallback(async (clientId: string) => {
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const success = await enhancedSnmpService.reconnectClient(clientId);
      
      if (success) {
        toast({
          title: "Client Reconnected", 
          description: "Client has been reconnected with appropriate speed limits applied.",
        });
      } else {
        toast({
          title: "Reconnection Failed",
          description: "Unable to reconnect client. Please check device connectivity.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error reconnecting client:', error);
      toast({
        title: "Network Error",
        description: "Failed to communicate with MikroTik devices.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const applySpeedLimit = useCallback(async (clientId: string, packageId: string) => {
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      const success = await enhancedSnmpService.applySpeedLimit(clientId, packageId);
      
      if (success) {
        toast({
          title: "Speed Limit Applied",
          description: "Speed limits have been configured on all MikroTik devices for the client.",
        });
      } else {
        toast({
          title: "Speed Limit Failed",
          description: "Unable to apply speed limits. Please check device connectivity.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error applying speed limit:', error);
      toast({
        title: "Speed Limit Error",
        description: "Failed to configure speed limits on MikroTik devices.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const getDataUsage = useCallback(async (clientId: string) => {
    try {
      const { dataUsageService } = await import('@/services/dataUsageService');
      return dataUsageService.getCurrentUsage(clientId);
    } catch (error) {
      console.error('Error getting data usage:', error);
      return null;
    }
  }, []);

  const getDeviceStatus = useCallback(async () => {
    try {
      const { enhancedSnmpService } = await import('@/services/enhancedSnmpService');
      return enhancedSnmpService.getDeviceStatus();
    } catch (error) {
      console.error('Error getting device status:', error);
      return [];
    }
  }, []);

  return {
    disconnectClient,
    reconnectClient,
    applySpeedLimit,
    getDataUsage,
    getDeviceStatus
  };
};
