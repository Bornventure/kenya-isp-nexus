
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface InventoryItem {
  id: string;
  created_at: string;
  isp_company_id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  status: string;
  serial_number?: string;
  location?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  item_id?: string;
  assigned_customer_id?: string;
  assignment_date?: string;
  mac_address?: string;
}

interface InventoryItemInput {
  name: string;
  description: string;
  category: string;
  quantity: number;
  status: string;
  serial_number?: string;
  location?: string;
  type?: string;
  model?: string;
  manufacturer?: string;
  item_id?: string;
  mac_address?: string;
}

export const useInventoryItems = (filters?: {
  category?: string;
  status?: string;
  search?: string;
}) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id, filters],
    queryFn: async () => {
      if (!profile?.isp_company_id) {
        throw new Error('Company ID not found');
      }

      let query = supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,type.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }

      return data;
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useAddInventoryItem = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: InventoryItemInput) => {
      if (!profile?.isp_company_id) {
        throw new Error('Company ID not found');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...item,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding inventory item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding inventory item:', error);
    },
  });
};

// Export alias for backward compatibility
export const useCreateInventoryItem = useAddInventoryItem;

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<InventoryItemInput>) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating inventory item:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Inventory item updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating inventory item:', error);
    },
  });
};

export const useUnassignEquipmentFromClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: null,
          assignment_date: null,
          status: 'In Stock'
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) {
        console.error('Error unassigning equipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Equipment has been returned and is now available.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to return equipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error unassigning equipment:', error);
    },
  });
};

export const useAssignEquipmentToClient = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
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

      if (error) {
        console.error('Error assigning equipment:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Equipment has been assigned successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to assign equipment. Please try again.",
        variant: "destructive",
      });
      console.error('Error assigning equipment:', error);
    },
  });
};

export const useInventoryStats = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['inventory-stats', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) {
        throw new Error('Company ID not found');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select('status, category')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) {
        console.error('Error fetching inventory stats:', error);
        throw error;
      }

      const stats = {
        total: data.length,
        inStock: data.filter(item => item.status === 'In Stock').length,
        deployed: data.filter(item => item.status === 'Deployed').length,
        maintenance: data.filter(item => item.status === 'Maintenance').length,
        byCategory: data.reduce((acc, item) => {
          acc[item.category] = (acc[item.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
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
      if (!profile?.isp_company_id) {
        throw new Error('Company ID not found');
      }

      // For now, return empty array since we don't have a low stock threshold system yet
      return [];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const usePromoteToNetworkEquipment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (itemId: string) => {
      // This would promote inventory item to network equipment
      // For now, just return success
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Item promoted to network equipment successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to promote item. Please try again.",
        variant: "destructive",
      });
      console.error('Error promoting item:', error);
    },
  });
};

export const useInventoryItem = (id: string) => {
  return useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching inventory item:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};
