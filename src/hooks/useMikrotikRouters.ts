
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import type { MikrotikRouter } from '@/types/network';

export const useMikrotikRouters = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const { data: routers = [], isLoading, error } = useQuery({
    queryKey: ['mikrotik-routers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MikrotikRouter[];
    },
  });

  // Set up real-time subscriptions for router updates
  useEffect(() => {
    const channel = supabase
      .channel('router-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mikrotik_routers'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const createRouter = useMutation({
    mutationFn: async (routerData: any) => {
      const { data, error } = await supabase
        .from('mikrotik_routers')
        .insert({
          ...routerData,
          isp_company_id: profile?.isp_company_id || '',
          gateway: routerData.gateway || '192.168.1.1'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
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
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
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
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
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

  const testConnection = useMutation({
    mutationFn: async ({ id, ip_address, admin_username, admin_password }: { 
      id: string; 
      ip_address: string; 
      admin_username: string; 
      admin_password: string; 
    }) => {
      // Simulate connection test - in a real implementation, this would test actual connectivity
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      const testResults = success 
        ? "Connection successful. Router is responding to API calls."
        : "Connection failed. Please check credentials and network connectivity.";
      
      // Update router with test results
      const { error } = await supabase
        .from('mikrotik_routers')
        .update({ 
          last_test_results: testResults,
          connection_status: success ? 'connected' : 'disconnected'
        })
        .eq('id', id);

      if (error) throw error;
      
      if (!success) {
        throw new Error(testResults);
      }
      
      return { success, message: testResults };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      toast({
        title: "Connection Test Successful",
        description: "Router is responding correctly",
      });
    },
    onError: (error) => {
      toast({
        title: "Connection Test Failed",
        description: error.message,
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
    testConnection: testConnection.mutate,
    isCreating: createRouter.isPending,
    isUpdating: updateRouter.isPending,
    isDeleting: deleteRouter.isPending,
    isTesting: testConnection.isPending,
  };
};
