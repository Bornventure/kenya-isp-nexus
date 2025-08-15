
import { useClients } from '@/hooks/useClients';
import { useNetworkManagement } from '@/hooks/useNetworkManagement';
import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useClientsWithNetworkManagement = () => {
  const clientsHook = useClients();
  const { disconnectClient, reconnectClient } = useNetworkManagement();
  const { toast } = useToast();

  // Enhanced update client function that includes network management
  const updateClientWithNetworkControl = useCallback(async ({ 
    id, 
    updates 
  }: { 
    id: string; 
    updates: Partial<Omit<any, 'id' | 'created_at' | 'updated_at'>>
  }) => {
    const previousClient = clientsHook.clients.find(c => c.id === id);
    const newStatus = updates.status;
    
    // Call the original update function
    clientsHook.updateClient({ id, updates });
    
    // Handle network management based on status changes
    if (newStatus && previousClient && previousClient.status !== newStatus) {
      console.log(`Client ${id} status changed from ${previousClient.status} to ${newStatus}`);
      
      try {
        if (newStatus === 'suspended' && previousClient.status === 'active') {
          // Client was suspended - disconnect from network
          const disconnected = await disconnectClient(id);
          if (disconnected) {
            toast({
              title: "Network Access Revoked",
              description: `Client ${previousClient.name} has been disconnected from the network due to suspension.`,
              variant: "destructive",
            });
          }
        } else if (newStatus === 'active' && previousClient.status === 'suspended') {
          // Client was reactivated - reconnect to network
          const reconnected = await reconnectClient(id);
          if (reconnected) {
            toast({
              title: "Network Access Restored",
              description: `Client ${previousClient.name} has been reconnected to the network.`,
            });
          }
        }
      } catch (error) {
        console.error('Network management error:', error);
        toast({
          title: "Network Management Error",
          description: "Status updated but network control failed. Please check manually.",
          variant: "destructive",
        });
      }
    }
  }, [clientsHook, disconnectClient, reconnectClient, toast]);

  // Monitor for automatic status changes (e.g., from payment processing)
  useEffect(() => {
    // This would listen for real-time status changes and trigger network actions
    // The actual implementation would depend on your real-time subscription setup
    
    const handleStatusChange = async (clientId: string, oldStatus: string, newStatus: string) => {
      console.log(`Automatic status change detected: Client ${clientId} ${oldStatus} -> ${newStatus}`);
      
      if (oldStatus === 'active' && newStatus === 'suspended') {
        await disconnectClient(clientId);
      } else if (oldStatus === 'suspended' && newStatus === 'active') {
        await reconnectClient(clientId);
      }
    };

    // Set up listener for status changes
    // This would integrate with your existing real-time updates
    
    return () => {
      // Cleanup listener
    };
  }, [disconnectClient, reconnectClient]);

  return {
    ...clientsHook,
    updateClient: updateClientWithNetworkControl,
  };
};
