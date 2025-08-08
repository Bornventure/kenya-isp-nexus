
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { radiusService, RadiusUser } from '@/services/radiusService';

export const useRadiusUsers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: radiusUsers = [], isLoading, refetch } = useQuery({
    queryKey: ['radius-users', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_users' as any)
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            status
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching RADIUS users:', error);
        return [];
      }

      return (data || []) as unknown as RadiusUser[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRadiusUser = useMutation({
    mutationFn: (clientId: string) => radiusService.createRadiusUser(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "Success",
        description: "RADIUS user created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create RADIUS user",
        variant: "destructive",
      });
    },
  });

  const updateRadiusUser = useMutation({
    mutationFn: ({ clientId, updates }: { clientId: string; updates: Partial<RadiusUser> }) =>
      radiusService.updateRadiusUser(clientId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "Success",
        description: "RADIUS user updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update RADIUS user",
        variant: "destructive",
      });
    },
  });

  const deleteRadiusUser = useMutation({
    mutationFn: (clientId: string) => radiusService.deleteRadiusUser(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "Success",
        description: "RADIUS user deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to delete RADIUS user",
        variant: "destructive",
      });
    },
  });

  const disconnectUser = useMutation({
    mutationFn: (username: string) => radiusService.disconnectUser(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      toast({
        title: "Success",
        description: "User disconnected successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to disconnect user",
        variant: "destructive",
      });
    },
  });

  return {
    radiusUsers,
    isLoading,
    refetch,
    createRadiusUser: createRadiusUser.mutate,
    updateRadiusUser: updateRadiusUser.mutate,
    deleteRadiusUser: deleteRadiusUser.mutate,
    disconnectUser: disconnectUser.mutate,
    isCreating: createRadiusUser.isPending,
    isUpdating: updateRadiusUser.isPending,
    isDeleting: deleteRadiusUser.isPending,
    isDisconnecting: disconnectUser.isPending,
  };
};
