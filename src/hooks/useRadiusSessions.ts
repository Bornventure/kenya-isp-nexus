
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { radiusService, RadiusSession } from '@/services/radiusService';

export const useRadiusSessions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading, refetch } = useQuery({
    queryKey: ['radius-sessions', profile?.isp_company_id],
    queryFn: () => radiusService.getActiveSessions(),
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const disconnectSession = useMutation({
    mutationFn: (username: string) => radiusService.disconnectUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      toast({
        title: "Success",
        description: "Session disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to disconnect session",
        variant: "destructive",
      });
    },
  });

  return {
    sessions,
    isLoading,
    refetch,
    disconnectSession: disconnectSession.mutate,
    isDisconnecting: disconnectSession.isPending,
  };
};
