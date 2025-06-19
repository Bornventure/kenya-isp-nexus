
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  item_id: string;
  name: string | null;
  category: string;
  type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  mac_address: string | null;
  status: string;
  location: string | null;
  supplier: string | null;
  cost: number | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  notes: text | null;
  quantity_in_stock: number | null;
  reorder_level: number | null;
  unit_cost: number | null;
  item_sku: string | null;
  assigned_customer_id: string | null;
  assigned_device_id: string | null;
  assignment_date: string | null;
  capacity: string | null;
  ip_address: string | null;
  subnet_mask: string | null;
  location_start_lat: number | null;
  location_start_lng: number | null;
  location_end_lat: number | null;
  location_end_lng: number | null;
  length_meters: number | null;
  installation_date: string | null;
  last_maintenance_date: string | null;
  is_network_equipment: boolean | null;
  equipment_id: string | null;
  isp_company_id: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    phone: string;
  };
}

export const useInventory = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [], isLoading, error } = useQuery({
    queryKey: ['inventory', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          clients:assigned_customer_id (
            name,
            phone
          )
        `)
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

  const createItemMutation = useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'item_id' | 'clients'>) => {
      if (!profile?.isp_company_id) {
        throw new Error('No ISP company associated with user');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...itemData,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Inventory item created successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to create inventory item",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });

  const assignToClientMutation = useMutation({
    mutationFn: async ({ itemId, clientId }: { itemId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: clientId,
          assignment_date: new Date().toISOString(),
          status: 'Deployed'
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({
        title: "Success",
        description: "Equipment assigned to client successfully",
      });
    },
    onError: (error) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to assign equipment to client",
        variant: "destructive",
      });
    },
  });

  const promoteToEquipmentMutation = useMutation({
    mutationFn: async ({ inventoryItemId, equipmentData }: { 
      inventoryItemId: string; 
      equipmentData: any;
    }) => {
      const { data, error } = await supabase
        .rpc('promote_inventory_to_equipment', {
          inventory_item_id: inventoryItemId,
          equipment_data: equipmentData
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({
        title: "Success",
        description: "Item promoted to network equipment successfully",
      });
    },
    onError: (error) => {
      console.error('Error promoting to equipment:', error);
      toast({
        title: "Error",
        description: "Failed to promote item to network equipment",
        variant: "destructive",
      });
    },
  });

  return {
    inventoryItems,
    isLoading,
    error,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    assignToClient: assignToClientMutation.mutate,
    promoteToEquipment: promoteToEquipmentMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    isAssigning: assignToClientMutation.iPending,
    isPromoting: promoteToEquipmentMutation.isPending,
  };
};
