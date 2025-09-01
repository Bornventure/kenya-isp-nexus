
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MikrotikRouter } from '@/types/network';

export const useMikrotikRouters = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: routers = [], isLoading } = useQuery({
    queryKey: ['mikrotik-routers', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as MikrotikRouter[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRouter = useMutation({
    mutationFn: async (routerData: Omit<MikrotikRouter, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('mikrotik_routers')
        .insert({
          ...routerData,
          gateway: routerData.gateway || '',
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
        .from('mikrotik_routers')
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mikrotik_routers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
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
    mutationFn: async (id: string) => {
      // Update connection status to testing
      await supabase
        .from('mikrotik_routers')
        .update({ 
          connection_status: 'testing',
          last_test_results: JSON.stringify({
            timestamp: new Date().toISOString(),
            status: 'testing'
          })
        })
        .eq('id', id);

      // Simulate connection test - in production this would be a real test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.2; // 80% success rate simulation
      
      const { error } = await supabase
        .from('mikrotik_routers')
        .update({ 
          connection_status: success ? 'online' : 'offline',
          last_test_results: JSON.stringify({
            timestamp: new Date().toISOString(),
            status: success ? 'success' : 'failed',
            message: success ? 'Connection successful' : 'Connection failed'
          })
        })
        .eq('id', id);

      if (error) throw error;
      return { success, id };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.success 
          ? "Router is responding to connection test." 
          : "Router is not responding. Check network connectivity.",
        variant: result.success ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      console.error('Error testing connection:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test router connection.",
        variant: "destructive",
      });
    },
  });

  return {
    routers,
    isLoading,
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
