
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { radiusService, MikrotikRouter } from '@/services/radiusService';

export const useMikrotikRouters = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routers = [], isLoading, refetch } = useQuery({
    queryKey: ['mikrotik-routers', profile?.isp_company_id],
    queryFn: () => radiusService.getMikrotikRouters(),
    enabled: !!profile?.isp_company_id,
  });

  const addRouter = useMutation({
    mutationFn: (router: Omit<MikrotikRouter, 'id' | 'isp_company_id'>) =>
      radiusService.addMikrotikRouter(router),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Success",
        description: "MikroTik router added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add MikroTik router",
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: (routerIp: string) => radiusService.testRouterConnection(routerIp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Success",
        description: "Router connection test successful",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Router connection test failed",
        variant: "destructive",
      });
    },
  });

  return {
    routers,
    isLoading,
    refetch,
    addRouter: addRouter.mutate,
    testConnection: testConnection.mutate,
    isAddingRouter: addRouter.isPending,
    isTestingConnection: testConnection.isPending,
  };
};
