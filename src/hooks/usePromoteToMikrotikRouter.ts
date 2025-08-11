
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface PromoteToMikrotikData {
  inventoryItemId: string;
  routerData: {
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
  };
}

export const usePromoteToMikrotikRouter = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inventoryItemId, routerData }: PromoteToMikrotikData) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      // First, create the MikroTik router record
      const { data: router, error: routerError } = await supabase
        .from('mikrotik_routers')
        .insert({
          ...routerData,
          status: 'pending',
          connection_status: 'offline',
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (routerError) {
        console.error('Error creating MikroTik router:', routerError);
        throw routerError;
      }

      // Update the inventory item status
      const { error: inventoryError } = await supabase
        .from('inventory_items')
        .update({
          status: 'Deployed',
          notes: 'Promoted to MikroTik Router',
          updated_at: new Date().toISOString(),
        })
        .eq('id', inventoryItemId);

      if (inventoryError) {
        console.error('Error updating inventory item:', inventoryError);
        // If inventory update fails, we should clean up the router record
        await supabase.from('mikrotik_routers').delete().eq('id', router.id);
        throw inventoryError;
      }

      return router;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['mikrotik-routers'] });
      
      toast({
        title: "Success",
        description: "Inventory item has been promoted to MikroTik router successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error promoting to MikroTik router:', error);
      toast({
        title: "Error",
        description: "Failed to promote item to MikroTik router. Please try again.",
        variant: "destructive",
      });
    },
  });
};
