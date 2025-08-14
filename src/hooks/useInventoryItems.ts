
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  item_id?: string;
  name?: string;
  type: string;
  category: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
  status: string;
  location?: string;
  quantity_in_stock?: number;
  reorder_level?: number;
  unit_cost?: number;
  notes?: string;
  isp_company_id?: string;
  created_at: string;
  updated_at: string;
}

export const useInventoryItems = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inventoryItems = [], isLoading, error, refetch } = useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }

      return (data || []) as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const createInventoryItem = useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
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
        description: error.message || "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Updated",
        description: "Inventory item has been updated successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteInventoryItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Deleted",
        description: "Inventory item has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    inventoryItems,
    isLoading,
    error,
    refetch,
    createInventoryItem: createInventoryItem.mutate,
    updateInventoryItem: updateInventoryItem.mutate,
    deleteInventoryItem: deleteInventoryItem.mutate,
    isCreating: createInventoryItem.isPending,
    isUpdating: updateInventoryItem.isPending,
    isDeleting: deleteInventoryItem.isPending,
  };
};
