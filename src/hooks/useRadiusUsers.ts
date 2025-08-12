
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RadiusUser {
  id: string;
  client_id?: string;
  username: string;
  password: string;
  group_name: string;
  max_upload: string;
  max_download: string;
  expiration?: string;
  is_active: boolean;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useRadiusUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: radiusUsers = [], isLoading } = useQuery({
    queryKey: ['radius-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radius_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RadiusUser[];
    },
  });

  const createRadiusUserMutation = useMutation({
    mutationFn: async (clientId: string) => {
      // Get client details first
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('name, email')
        .eq('id', clientId)
        .single();

      if (clientError) throw clientError;

      const username = client.email || `user_${Date.now()}`;
      const password = Math.random().toString(36).substring(2, 10);

      const { data, error } = await supabase
        .from('radius_users')
        .insert({
          client_id: clientId,
          username,
          password,
          group_name: 'default',
          max_upload: '10M',
          max_download: '10M',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "RADIUS User Created",
        description: "New RADIUS user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create RADIUS User",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const updateRadiusUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RadiusUser> }) => {
      const { data, error } = await supabase
        .from('radius_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "RADIUS User Updated",
        description: "RADIUS user has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Update RADIUS User",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const deleteRadiusUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('radius_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "RADIUS User Deleted",
        description: "RADIUS user has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Delete RADIUS User",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  const disconnectUserMutation = useMutation({
    mutationFn: async (username: string) => {
      // This would integrate with actual RADIUS or MikroTik to disconnect the user
      // For now, we'll just update the session status in our database
      console.log(`Disconnecting user: ${username}`);
      
      // Update any active sessions for this user
      const { error } = await supabase
        .from('network_sessions')
        .update({ status: 'disconnected' })
        .eq('username', username)
        .eq('status', 'active');

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "User Disconnected",
        description: "User has been disconnected successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Disconnect User",
        description: error.message || 'Unknown error occurred',
        variant: "destructive",
      });
    },
  });

  return {
    radiusUsers,
    isLoading,
    createRadiusUser: createRadiusUserMutation.mutateAsync,
    updateRadiusUser: updateRadiusUserMutation.mutateAsync,
    deleteRadiusUser: deleteRadiusUserMutation.mutateAsync,
    disconnectUser: disconnectUserMutation.mutateAsync,
    isCreating: createRadiusUserMutation.isPending,
    isUpdating: updateRadiusUserMutation.isPending,
    isDeleting: deleteRadiusUserMutation.isPending,
    isDisconnecting: disconnectUserMutation.isPending,
  };
};
