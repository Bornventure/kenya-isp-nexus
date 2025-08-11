
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
      const { data, error } = await supabase.rpc('promote_inventory_to_mikrotik_router', {
        inventory_item_id: inventoryItemId,
        router_data: routerData
      });

      if (error) {
        console.error('Error promoting to MikroTik router:', error);
        throw error;
      }

      return data;
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
