
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  item_id: string;
  name: string;
  category: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
  status: string;
  quantity_in_stock: number;
  reorder_level?: number;
  unit_cost?: number;
  cost?: number;
  supplier?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  purchase_date?: string;
  warranty_expiry_date?: string;
  item_sku?: string;
  capacity?: string;
  installation_date?: string;
  ip_address?: string;
  subnet_mask?: string;
  assignment_date?: string;
  assigned_customer_id?: string;
  assigned_device_id?: string;
  equipment_id?: string;
  is_network_equipment?: boolean;
  clients?: {
    name: string;
    phone: string;
  };
}

export interface InventoryHistory {
  id: string;
  inventory_item_id: string;
  action: string;
  details: string;
  created_at: string;
  performed_by: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export interface InventoryStats {
  total: number;
  inStock: number;
  deployed: number;
  maintenance: number;
  byCategory: Record<string, number>;
}

export const useInventory = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          clients (
            name,
            phone
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!id,
  });
};

export const useInventoryItems = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id, filters],
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          clients (
            name,
            phone
          )
        `)
        .eq('isp_company_id', profile?.isp_company_id);

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%,item_id.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useInventoryStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-stats', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('status, category')
        .eq('isp_company_id', profile?.isp_company_id);

      if (error) throw error;

      const stats: InventoryStats = {
        total: data.length,
        inStock: data.filter(item => item.status === 'In Stock').length,
        deployed: data.filter(item => item.status === 'Deployed').length,
        maintenance: data.filter(item => item.status === 'Maintenance').length,
        byCategory: {}
      };

      data.forEach(item => {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      });

      return stats;
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useInventoryHistory = (itemId: string) => {
  return useQuery({
    queryKey: ['inventory-history', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_history')
        .select(`
          *,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryHistory[];
    },
    enabled: !!itemId,
  });
};

export const useLowStockItems = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['low-stock-items', profile?.isp_company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile?.isp_company_id)
        .not('reorder_level', 'is', null)
        .lt('quantity_in_stock', 'reorder_level');

      if (error) throw error;
      return data as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useCreateInventoryItem = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...itemData,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
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
    }
  });
};

export const useUpdateInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
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
    }
  });
};

export const useAssignEquipmentToClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, clientId }: { itemId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: clientId,
          status: 'Deployed',
          assignment_date: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Equipment assigned successfully",
      });
    },
    onError: (error) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to assign equipment",
        variant: "destructive",
      });
    }
  });
};

export const useUnassignEquipmentFromClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: null,
          status: 'Returned',
          assignment_date: null
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Equipment unassigned successfully",
      });
    },
    onError: (error) => {
      console.error('Error unassigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to unassign equipment",
        variant: "destructive",
      });
    }
  });
};

export const useAssignInventoryToClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, clientId }: { itemId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: clientId,
          status: 'Deployed',
          assignment_date: new Date().toISOString()
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Success",
        description: "Equipment assigned successfully",
      });
    },
    onError: (error) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to assign equipment",
        variant: "destructive",
      });
    }
  });
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inventoryItemId, equipmentData }: { 
      inventoryItemId: string; 
      equipmentData: any;
    }) => {
      const { data, error } = await supabase.rpc('promote_inventory_to_equipment', {
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
    }
  });
};
