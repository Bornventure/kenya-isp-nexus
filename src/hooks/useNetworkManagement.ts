
import { useCallback } from 'react';
import { snmpService } from '@/services/snmpService';
import { qosService } from '@/services/qosService';
import { useToast } from '@/hooks/use-toast';

export const useNetworkManagement = () => {
  const { toast } = useToast();

  const disconnectClient = useCallback(async (clientId: string) => {
    try {
      const success = await snmpService.disconnectClient(clientId);
      if (success) {
        toast({
          title: "Client Disconnected",
          description: "Network access and QoS policies have been revoked due to suspended status.",
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
          description: "Network access and QoS policies have been restored.",
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

  const applyQoSToClient = useCallback(async (clientId: string, packageId: string) => {
    try {
      const success = await qosService.applyQoSToClient(clientId, packageId);
      if (success) {
        toast({
          title: "QoS Applied",
          description: "Speed limits and traffic policies have been configured for the client.",
        });
      } else {
        toast({
          title: "QoS Configuration Failed",
          description: "Unable to apply speed limits to client.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error applying QoS:', error);
      toast({
        title: "QoS Error",
        description: "Failed to configure speed limits.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const updateClientQoS = useCallback(async (clientId: string, newPackageId: string) => {
    try {
      const success = await qosService.updateClientQoS(clientId, newPackageId);
      if (success) {
        toast({
          title: "QoS Updated",
          description: "Client speed limits have been updated to match new package.",
        });
      } else {
        toast({
          title: "QoS Update Failed",
          description: "Unable to update client speed limits.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error updating QoS:', error);
      toast({
        title: "QoS Update Error",
        description: "Failed to update speed limits.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  const removeQoSFromClient = useCallback(async (clientId: string) => {
    try {
      const success = await qosService.removeQoSFromClient(clientId);
      if (success) {
        toast({
          title: "QoS Removed",
          description: "Speed limits have been removed from client.",
        });
      } else {
        toast({
          title: "QoS Removal Failed",
          description: "Unable to remove speed limits from client.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error('Error removing QoS:', error);
      toast({
        title: "QoS Removal Error",
        description: "Failed to remove speed limits.",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return {
    disconnectClient,
    reconnectClient,
    applyQoSToClient,
    updateClientQoS,
    removeQoSFromClient
  };
};
