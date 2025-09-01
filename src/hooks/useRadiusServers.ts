
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface RadiusServer {
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
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  last_synced_at?: string;
  router?: {
    id: string;
    name: string;
    ip_address: string;
  };
}

export const useRadiusServers = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: radiusServers = [], isLoading } = useQuery({
    queryKey: ['radius-servers', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('radius_servers')
        .select(`
          *,
          router:mikrotik_routers(id, name, ip_address)
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RadiusServer[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRadiusServer = useMutation({
    mutationFn: async (serverData: Omit<RadiusServer, 'id' | 'created_at' | 'updated_at' | 'isp_company_id' | 'router'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('radius_servers')
        .insert({
          ...serverData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "RADIUS Server Added",
        description: "Router has been enabled for RADIUS authentication.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating RADIUS server:', error);
      toast({
        title: "Error",
        description: "Failed to enable RADIUS. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRadiusServer = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<RadiusServer> }) => {
      const { data, error } = await supabase
        .from('radius_servers')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "RADIUS Server Updated",
        description: "RADIUS configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating RADIUS server:', error);
      toast({
        title: "Error",
        description: "Failed to update RADIUS configuration.",
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
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radius-servers'] });
      toast({
        title: "RADIUS Configuration Removed",
        description: "Router RADIUS configuration has been removed.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting RADIUS server:', error);
      toast({
        title: "Error",
        description: "Failed to remove RADIUS configuration.",
        variant: "destructive",
      });
    },
  });

  return {
    radiusServers,
    isLoading,
    createRadiusServer: createRadiusServer.mutate,
    updateRadiusServer: updateRadiusServer.mutate,
    deleteRadiusServer: deleteRadiusServer.mutate,
    isCreating: createRadiusServer.isPending,
    isUpdating: updateRadiusServer.isPending,
    isDeleting: deleteRadiusServer.isPending,
  };
};
