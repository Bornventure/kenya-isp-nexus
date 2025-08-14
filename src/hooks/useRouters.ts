
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { MikrotikRouter } from '@/types/network';

export const useRouters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routers = [], isLoading, error } = useQuery({
    queryKey: ['routers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MikrotikRouter[];
    },
  });

  const createRouter = useMutation({
    mutationFn: async (routerData: Omit<MikrotikRouter, 'id' | 'created_at' | 'updated_at'>) => {
      // Ensure all required fields are present
      const insertData = {
        name: routerData.name,
        ip_address: routerData.ip_address,
        admin_username: routerData.admin_username,
        admin_password: routerData.admin_password,
        snmp_community: routerData.snmp_community || 'public',
        snmp_version: routerData.snmp_version || 2,
        pppoe_interface: routerData.pppoe_interface || 'ether1',
        dns_servers: routerData.dns_servers || '8.8.8.8,8.8.4.4',
        client_network: routerData.client_network || '192.168.1.0/24',
        gateway: routerData.gateway || '192.168.1.1',
        status: routerData.status || 'offline',
        connection_status: routerData.connection_status || 'disconnected',
        last_test_results: routerData.last_test_results || '',
        isp_company_id: routerData.isp_company_id,
      };

      const { data, error } = await supabase
        .from('mikrotik_routers')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast({
        title: "Success",
        description: "Router created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create router: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateRouter = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MikrotikRouter> }) => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast({
        title: "Success",
        description: "Router updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update router: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteRouter = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mikrotik_routers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
      toast({
        title: "Success",
        description: "Router deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete router: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    routers,
    isLoading,
    error,
    createRouter: createRouter.mutate,
    updateRouter: updateRouter.mutate,
    deleteRouter: deleteRouter.mutate,
    isCreating: createRouter.isPending,
    isUpdating: updateRouter.isPending,
    isDeleting: deleteRouter.isPending,
  };
};
