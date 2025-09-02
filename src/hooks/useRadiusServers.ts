
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RadiusServer {
  id: string;
  name: string;
  server_address: string;
  auth_port: number;
  accounting_port: number;
  shared_secret: string;
  timeout_seconds: number;
  is_enabled: boolean;
  is_primary: boolean;
  router_id: string;
  last_synced_at?: string;
  router?: {
    name: string;
    ip_address: string;
  };
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useRadiusServers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: radiusServers = [], isLoading, error } = useQuery({
    queryKey: ['radius-servers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('radius_servers')
        .select(`
          *,
          router:mikrotik_routers(name, ip_address)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RadiusServer[];
    },
  });

  const createRadiusServer = useMutation({
    mutationFn: async (serverData: Omit<RadiusServer, 'id' | 'created_at' | 'updated_at' | 'router' | 'isp_company_id'>) => {
      const { data, error } = await supabase
        .from('radius_servers')
        .insert({
          ...serverData,
          isp_company_id: profile?.isp_company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "Success",
        description: "RADIUS server configuration created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create RADIUS server: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateRadiusServer = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RadiusServer> }) => {
      const { data, error } = await supabase
        .from('radius_servers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "Success",
        description: "RADIUS server updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update RADIUS server: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRadiusServer = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('radius_servers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "Success",
        description: "RADIUS server configuration removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove RADIUS server: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    radiusServers,
    isLoading,
    error,
    createRadiusServer: createRadiusServer.mutate,
    updateRadiusServer: updateRadiusServer.mutate,
    deleteRadiusServer: deleteRadiusServer.mutate,
    isCreating: createRadiusServer.isPending,
    isUpdating: updateRadiusServer.isPending,
    isDeleting: deleteRadiusServer.isPending,
  };
};
