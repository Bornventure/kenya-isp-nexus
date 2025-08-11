
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MikrotikRouterData {
  name?: string;
  ip_address: string;
  admin_username?: string;
  admin_password: string;
  snmp_community?: string;
  snmp_version?: number;
  pppoe_interface?: string;
  dns_servers?: string;
  client_network?: string;
  gateway?: string;
}

export const usePromoteToMikrotikRouter = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inventoryItemId, routerData }: { 
      inventoryItemId: string; 
      routerData: MikrotikRouterData;
    }) => {
      // Get the inventory item first
      const { data: inventoryItem, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', inventoryItemId)
        .single();

      if (inventoryError || !inventoryItem) {
        throw new Error('Inventory item not found');
      }

      // Create MikroTik router record
      const { data: router, error: routerError } = await supabase
        .from('mikrotik_routers')
        .insert({
          name: routerData.name || inventoryItem.name || 'MikroTik Router',
          ip_address: routerData.ip_address,
          admin_username: routerData.admin_username || 'admin',
          admin_password: routerData.admin_password,
          snmp_community: routerData.snmp_community || 'public',
          snmp_version: routerData.snmp_version || 2,
          pppoe_interface: routerData.pppoe_interface || 'pppoe-server1',
          dns_servers: routerData.dns_servers || '8.8.8.8,8.8.4.4',
          client_network: routerData.client_network || '10.0.0.0/24',
          gateway: routerData.gateway,
          status: 'pending',
          isp_company_id: inventoryItem.isp_company_id
        })
        .select()
        .single();

      if (routerError) {
        console.error('Error creating MikroTik router:', routerError);
        throw routerError;
      }

      // Update inventory item to mark as promoted
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({
          status: 'Deployed',
          notes: (inventoryItem.notes || '') + ' - Promoted to MikroTik Router'
        })
        .eq('id', inventoryItemId);

      if (updateError) {
        console.error('Error updating inventory item:', updateError);
        throw updateError;
      }

      return router;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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
        description: "Failed to promote inventory item to MikroTik router.",
        variant: "destructive",
      });
    },
  });
};
