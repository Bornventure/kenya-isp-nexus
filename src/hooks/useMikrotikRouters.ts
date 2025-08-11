import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { realMikrotikService } from '@/services/realMikrotikService';

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
        .from('mikrotik_routers')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching routers:', error);
        throw error;
      }

      return (data || []) as MikrotikRouter[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createRouter = useMutation({
    mutationFn: async (routerData: Omit<MikrotikRouter, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      console.log('Creating router with data:', routerData);

      // Validate required fields
      if (!routerData.name?.trim()) {
        throw new Error('Router name is required');
      }
      
      if (!routerData.ip_address?.trim()) {
        throw new Error('IP address is required');
      }

      // Validate IP address format
      const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      if (!ipRegex.test(routerData.ip_address)) {
        throw new Error('Invalid IP address format');
      }

      if (!routerData.admin_password?.trim()) {
        throw new Error('Admin password is required');
      }

      // Helper function to generate default gateway from IP address
      const generateDefaultGateway = (ipAddress: string) => {
        const parts = ipAddress.split('.');
        // Use .1 as default gateway (common practice)
        return `${parts[0]}.${parts[1]}.${parts[2]}.1`;
      };

      // Prepare data for database insertion
      const insertData = {
        name: routerData.name.trim(),
        ip_address: routerData.ip_address.trim(),
        admin_username: routerData.admin_username?.trim() || 'admin',
        admin_password: routerData.admin_password.trim(),
        snmp_community: routerData.snmp_community?.trim() || 'public',
        snmp_version: Number(routerData.snmp_version) || 2,
        pppoe_interface: routerData.pppoe_interface?.trim() || 'pppoe-server1',
        dns_servers: routerData.dns_servers?.trim() || '8.8.8.8,8.8.4.4',
        client_network: routerData.client_network?.trim() || '10.0.0.0/24',
        gateway: routerData.gateway?.trim() || generateDefaultGateway(routerData.ip_address), // Provide default gateway
        status: 'pending' as const,
        last_test_results: null,
        connection_status: 'offline' as const,
        isp_company_id: profile.isp_company_id,
      };

      console.log('Inserting router data:', insertData);

      const { data, error } = await supabase
        .from('mikrotik_routers')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(`Failed to create router: ${error.message}`);
      }

      console.log('Router created successfully:', data);
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
        description: error.message || "Failed to add router. Please try again.",
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
    mutationFn: async (routerId: string) => {
      const { error } = await supabase
        .from('mikrotik_routers')
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

      console.log('Starting real connection test for router:', router.name);

      // Update status to testing
      await updateRouter.mutateAsync({
        id: routerId,
        updates: { connection_status: 'testing' }
      });

      // Perform real connection test
      const testResults = await realMikrotikService.testConnection({
        ip: router.ip_address,
        username: router.admin_username,
        password: router.admin_password,
        port: 8728
      });

      console.log('Real test results:', testResults);

      // Get system info if connection is successful
      let systemInfo = null;
      if (testResults.success) {
        try {
          systemInfo = await realMikrotikService.getSystemInfo({
            ip: router.ip_address,
            username: router.admin_username,
            password: router.admin_password,
            port: 8728
          });
        } catch (error) {
          console.warn('Could not get system info:', error);
        }
      }

      const overallStatus = testResults.success ? 'online' : 'offline';
      const routerStatus = testResults.success ? 'active' : 'error';

      // Update with real test results
      return updateRouter.mutateAsync({
        id: routerId,
        updates: {
          connection_status: overallStatus,
          last_test_results: {
            ...testResults,
            systemInfo,
            timestamp: new Date().toISOString()
          },
          status: routerStatus
        }
      });
    },
    onSuccess: (result, routerId) => {
      const router = routers.find(r => r.id === routerId);
      const success = result?.connection_status === 'online';
      
      toast({
        title: success ? "Connection Test Successful" : "Connection Test Failed",
        description: success 
          ? `Router "${router?.name}" is online and accessible.`
          : `Router "${router?.name}" is not responding. Check network connectivity and credentials.`,
        variant: success ? "default" : "destructive",
      });
    },
    onError: (error: any, routerId) => {
      console.error('Connection test error:', error);
      const router = routers.find(r => r.id === routerId);
      
      // Update status to offline on error
      updateRouter.mutate({
        id: routerId,
        updates: {
          connection_status: 'offline',
          status: 'error',
          last_test_results: {
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        }
      });

      toast({
        title: "Connection Test Error",
        description: `Failed to test router "${router?.name}": ${error.message}`,
        variant: "destructive",
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
