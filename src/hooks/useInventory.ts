
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
  clients?: {
    id: string;
    name: string;
    phone: string;
  };
  assignment_date?: string;
  installation_date?: string;
  item_sku?: string;
  capacity?: string;
  ip_address?: string;
  subnet_mask?: string;
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

// Additional hooks that components depend on
export const useInventoryItems = (filters?: { category?: string; status?: string; search?: string }) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id, filters],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,type.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useInventoryItem = (itemId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          clients (
            id,
            name,
            phone
          )
        `)
        .eq('id', itemId)
        .eq('isp_company_id', profile?.isp_company_id || '')
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!itemId && !!profile?.isp_company_id,
  });
};

export const useCreateInventoryItem = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
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
};

export const useUpdateInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { id: string } & Partial<InventoryItem>) => {
      const { id, ...updates } = params;
      
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
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item'] });
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
};

export const useDeleteInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
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
};

export const useAssignEquipmentToClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, clientId }: { itemId: string; clientId: string }) => {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          status: 'Deployed',
          assignment_date: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;

      // Create client equipment assignment
      const { error: assignError } = await supabase
        .from('client_equipment')
        .insert({
          client_id: clientId,
          inventory_item_id: itemId,
          status: 'active',
        });

      if (assignError) throw assignError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Equipment Assigned",
        description: "Equipment has been assigned to client successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUnassignEquipmentFromClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('inventory_items')
        .update({
          status: 'In Stock',
          assignment_date: null,
        })
        .eq('id', itemId);

      if (error) throw error;

      // Remove client equipment assignment
      const { error: unassignError } = await supabase
        .from('client_equipment')
        .delete()
        .eq('inventory_item_id', itemId);

      if (unassignError) throw unassignError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Equipment Returned",
        description: "Equipment has been returned successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error returning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to return equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useInventoryStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-stats', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return null;

      const { data, error } = await supabase
        .from('inventory_items')
        .select('status, category')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) throw error;

      const stats = {
        total: data.length,
        in_stock: data.filter(item => item.status === 'In Stock').length,
        deployed: data.filter(item => item.status === 'Deployed').length,
        maintenance: data.filter(item => item.status === 'Maintenance').length,
        by_category: data.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      return stats;
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useLowStockItems = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['low-stock-items', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .not('quantity_in_stock', 'is', null)
        .not('reorder_level', 'is', null)
        .filter('quantity_in_stock', 'lte', 'reorder_level');

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
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
