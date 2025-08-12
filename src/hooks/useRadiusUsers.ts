
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RadiusUser {
  id: string;
  client_id: string;
  username: string;
  password: string;
  group_name: string;
  max_upload: string;
  max_download: string;
  expiration?: string;
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useRadiusUsers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: radiusUsers = [], isLoading } = useQuery({
    queryKey: ['radius-users', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_users')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RadiusUser[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRadiusUser = useMutation({
    mutationFn: async (clientId: string) => {
      // Get client details first
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      const userData = {
        client_id: clientId,
        username: client.email || client.phone,
        password: generateSecurePassword(),
        group_name: 'default',
        max_upload: '10M',
        max_download: '10M',
        is_active: true,
        isp_company_id: client.isp_company_id
      };

      const { data, error } = await supabase
        .from('radius_users')
        .insert(userData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      toast({
        title: "RADIUS User Created",
        description: "RADIUS user has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating RADIUS user:', error);
      toast({
        title: "Error",
        description: "Failed to create RADIUS user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const disconnectUser = useMutation({
    mutationFn: async (username: string) => {
      // Update any active sessions to disconnected
      const { error } = await supabase
        .from('network_sessions')
        .update({ status: 'disconnected' })
        .eq('username', username)
        .eq('status', 'active');

      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      toast({
        title: "User Disconnected",
        description: "User has been disconnected from the network.",
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      console.error('Error disconnecting user:', error);
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  return {
    radiusUsers,
    isLoading,
    createRadiusUser: createRadiusUser.mutateAsync,
    disconnectUser: disconnectUser.mutateAsync,
    isCreating: createRadiusUser.isPending,
    isDisconnecting: disconnectUser.isPending,
  };
};
