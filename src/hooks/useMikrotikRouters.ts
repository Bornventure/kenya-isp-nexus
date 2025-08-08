
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MikrotikRouter {
  id: string;
  name: string;
  ip_address: string;
  admin_username: string;
  admin_password: string;
  snmp_community: string;
  snmp_version: number;
  pppoe_interface: string;
  dns_servers: string;
  client_network: string;
  gateway: string;
  status: 'pending' | 'active' | 'inactive' | 'error';
  last_test_results: any;
  connection_status: 'online' | 'offline' | 'testing';
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useMikrotikRouters = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routers = [], isLoading, refetch } = useQuery({
    queryKey: ['mikrotik-routers', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('mikrotik_routers' as any)
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching routers:', error);
        throw error;
      }

      return (data || []) as unknown as MikrotikRouter[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRouter = useMutation({
    mutationFn: async (routerData: Omit<MikrotikRouter, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('mikrotik_routers' as any)
        .insert({
          ...routerData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Router Added",
        description: "MikroTik router has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating router:', error);
      toast({
        title: "Error",
        description: "Failed to add router. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateRouter = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MikrotikRouter> }) => {
      const { data, error } = await supabase
        .from('mikrotik_routers' as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Router Updated",
        description: "MikroTik router has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating router:', error);
      toast({
        title: "Error",
        description: "Failed to update router. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteRouter = useMutation({
    mutationFn: async (routerId: string) => {
      const { error } = await supabase
        .from('mikrotik_routers' as any)
        .delete()
        .eq('id', routerId);

      if (error) throw error;
      return routerId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Router Deleted",
        description: "MikroTik router has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting router:', error);
      toast({
        title: "Error",
        description: "Failed to delete router. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testConnection = useMutation({
    mutationFn: async (routerId: string) => {
      const router = routers.find(r => r.id === routerId);
      if (!router) throw new Error('Router not found');

      // Update status to testing
      await updateRouter.mutateAsync({
        id: routerId,
        updates: { connection_status: 'testing' }
      });

      // Simulate connection tests
      const testResults = {
        ping: true,
        snmp: Math.random() > 0.1,
        ssh: Math.random() > 0.3,
        api: Math.random() > 0.2,
        timestamp: new Date().toISOString()
      };

      const overallStatus = testResults.ping && testResults.snmp && testResults.api ? 'online' : 'offline';

      // Update with test results
      return updateRouter.mutateAsync({
        id: routerId,
        updates: {
          connection_status: overallStatus,
          last_test_results: testResults,
          status: overallStatus === 'online' ? 'active' : 'error'
        }
      });
    },
    onSuccess: () => {
      toast({
        title: "Connection Test Complete",
        description: "Router connection test has been completed.",
      });
    },
  });

  return {
    routers,
    isLoading,
    refetch,
    createRouter: createRouter.mutate,
    updateRouter: updateRouter.mutate,
    deleteRouter: deleteRouter.mutate,
    testConnection: testConnection.mutate,
    isCreating: createRouter.isPending,
    isUpdating: updateRouter.isPending,
    isDeleting: deleteRouter.isPending,
    isTesting: testConnection.isPending,
  };
};
