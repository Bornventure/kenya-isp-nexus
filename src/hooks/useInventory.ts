
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  item_id: string;
  name: string;
  type: string;
  category: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  mac_address?: string;
  status: string;
  location?: string;
  notes?: string;
  cost?: number;
  purchase_date?: string;
  warranty_expiry_date?: string;
  supplier?: string;
  quantity_in_stock?: number;
  reorder_level?: number;
  unit_cost?: number;
  barcode?: string;
  is_network_equipment: boolean;
  equipment_id?: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useInventory = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory:', error);
        throw error;
      }

      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createItem = useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'isp_company_id' | 'item_id' | 'is_network_equipment'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...itemData,
          isp_company_id: profile.isp_company_id,
          is_network_equipment: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Added",
        description: "Inventory item has been added successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    items,
    isLoading,
    error,
    createItem: createItem.mutate,
    isCreating: createItem.isPending,
  };
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inventoryItemId, equipmentData }: {
      inventoryItemId: string;
      equipmentData: {
        equipment_type_id?: string;
        ip_address?: string;
        snmp_community?: string;
        snmp_version?: number;
        notes?: string;
      };
    }) => {
      const { data, error } = await supabase.rpc('promote_inventory_to_equipment', {
        inventory_item_id: inventoryItemId,
        equipment_data: equipmentData,
      });

      if (error) {
        console.error('Error promoting to equipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['network-equipment'] });
      toast({
        title: "Success",
        description: "Inventory item has been promoted to network equipment successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error promoting to equipment:', error);
      toast({
        title: "Error",
        description: "Failed to promote item to network equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
};
