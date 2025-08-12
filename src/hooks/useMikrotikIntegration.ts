
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { mikrotikService, type PPPoEUser, type BandwidthLimit } from '@/services/mikrotikService';

export const useMikrotikIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: activeClients = [], isLoading: isLoadingClients, refetch: refetchClients } = useQuery({
    queryKey: ['mikrotik-active-clients'],
    queryFn: () => mikrotikService.listActiveClients(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: interfaces = [], isLoading: isLoadingInterfaces } = useQuery({
    queryKey: ['mikrotik-interfaces'],
    queryFn: () => mikrotikService.getInterfaces(),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: systemResources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['mikrotik-system-resources'],
    queryFn: () => mikrotikService.getSystemResources(),
    refetchInterval: 30000,
  });

  const addClientMutation = useMutation({
    mutationFn: (userData: PPPoEUser) => mikrotikService.addClient(userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-active-clients'] });
      toast({
        title: "Client Added",
        description: "PPPoE client has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Client",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const disconnectClientMutation = useMutation({
    mutationFn: (username: string) => mikrotikService.disconnectClient(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-active-clients'] });
      toast({
        title: "Client Disconnected",
        description: "Client has been disconnected successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Disconnect Client",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const updateBandwidthMutation = useMutation({
    mutationFn: ({ username, limits }: { username: string; limits: BandwidthLimit }) =>
      mikrotikService.updateBandwidth(username, limits),
    onSuccess: () => {
      toast({
        title: "Bandwidth Updated",
        description: "Client bandwidth limits have been updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update Bandwidth",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => mikrotikService.testConnection(),
    onError: (error: any) => {
      toast({
        title: "Connection Test Failed",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    activeClients,
    interfaces,
    systemResources,
    
    // Loading states
    isLoadingClients,
    isLoadingInterfaces,
    isLoadingResources,
    
    // Actions
    addClient: addClientMutation.mutate,
    disconnectClient: disconnectClientMutation.mutate,
    updateBandwidth: updateBandwidthMutation.mutate,
    testConnection: testConnectionMutation.mutate,
    refetchClients,
    
    // Mutation states
    isAddingClient: addClientMutation.isPending,
    isDisconnecting: disconnectClientMutation.isPending,
    isUpdatingBandwidth: updateBandwidthMutation.isPending,
    isTesting: testConnectionMutation.isPending,
  };
};
