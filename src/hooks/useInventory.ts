
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { clientDeploymentService } from '@/services/clientDeploymentService';

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
  notes?: string;
  supplier?: string;
  unit_cost?: number;
  quantity_in_stock?: number;
  reorder_level?: number;
  assigned_customer_id?: string;
  assigned_device_id?: string;
  assignment_date?: string;
  purchase_date?: string;
  warranty_expiry_date?: string;
  cost?: number;
  ip_address?: string;
  subnet_mask?: string;
  capacity?: string;
  location_start_lat?: number;
  location_start_lng?: number;
  location_end_lat?: number;
  location_end_lng?: number;
  length_meters?: number;
  installation_date?: string;
  last_maintenance_date?: string;
  is_network_equipment?: boolean;
  equipment_id?: string;
  isp_company_id?: string;
  created_at?: string;
  updated_at?: string;
  item_sku?: string;
  clients?: {
    id: string;
    name: string;
    phone: string;
  };
}

export const useInventoryItems = (filters: {
  category?: string;
  status?: string;
  search?: string;
} = {}) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id, filters],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          clients!inventory_items_assigned_customer_id_fkey (
            id,
            name,
            phone
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,type.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inventory items:', error);
        throw error;
      }

      return (data || []) as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useInventoryItem = (itemId: string) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-item', itemId],
    queryFn: async () => {
      if (!itemId) return null;

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          clients!inventory_items_assigned_customer_id_fkey (
            id,
            name,
            phone
          )
        `)
        .eq('id', itemId)
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!itemId,
  });
};

export const useCreateInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (itemData: Partial<InventoryItem>) => {
      if (!itemData.category || !itemData.type) {
        throw new Error('Category and type are required');
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...itemData,
          category: itemData.category,
          type: itemData.type,
          isp_company_id: profile?.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Item Created",
        description: "Inventory item has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating inventory item:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create inventory item. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInventoryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, updates }: { itemId: string; updates: Partial<InventoryItem> }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(updates)
        .eq('id', itemId)
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
    onError: (error) => {
      console.error('Error updating inventory item:', error);
      toast({
        title: "Update Failed",
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
    onError: (error) => {
      console.error('Error deleting inventory item:', error);
      toast({
        title: "Deletion Failed",
        description: "Failed to delete inventory item. Please try again.",
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
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .not('quantity_in_stock', 'is', null)
        .not('reorder_level', 'is', null);

      if (error) throw error;

      // Filter items where quantity is less than or equal to reorder level
      const lowStockItems = (data || []).filter(item => 
        item.quantity_in_stock !== null && 
        item.reorder_level !== null && 
        item.quantity_in_stock <= item.reorder_level
      );

      return lowStockItems as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const usePromoteToNetworkEquipment = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      inventoryItemId, 
      equipmentData 
    }: { 
      inventoryItemId: string; 
      equipmentData: any;
    }) => {
      // First create equipment record
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (equipmentError) throw equipmentError;

      // Then update inventory item to reference the equipment
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory_items')
        .update({
          is_network_equipment: true,
          equipment_id: equipment.id,
        })
        .eq('id', inventoryItemId)
        .select()
        .single();

      if (updateError) throw updateError;

      return { equipment, inventoryItem: updatedItem };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Equipment Promoted",
        description: "Item has been promoted to network equipment successfully.",
      });
    },
    onError: (error) => {
      console.error('Error promoting to network equipment:', error);
      toast({
        title: "Promotion Failed",
        description: "Failed to promote item to network equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
};

export const useAssignEquipmentToClient = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      itemId, 
      clientId, 
      clientName 
    }: { 
      itemId: string; 
      clientId: string; 
      clientName: string;
    }) => {
      // 1. Update inventory item assignment
      const { data: updatedItem, error: updateError } = await supabase
        .from('inventory_items')
        .update({
          assigned_customer_id: clientId,
          assignment_date: new Date().toISOString(),
          status: 'Deployed'
        })
        .eq('id', itemId)
        .select()
        .single();

      if (updateError) throw updateError;

      // 2. If this is network equipment, also deploy it fully
      if (updatedItem.is_network_equipment && updatedItem.equipment_id) {
        console.log('Deploying network equipment with full integration...');
        const deploymentResult = await clientDeploymentService.deployClientEquipment(
          clientId, 
          updatedItem.equipment_id
        );

        if (!deploymentResult.success) {
          console.warn('Full deployment failed:', deploymentResult.message);
        }

        return {
          item: updatedItem,
          deployment: deploymentResult
        };
      }

      return {
        item: updatedItem,
        deployment: null
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      
      if (result.deployment?.success) {
        toast({
          title: "Equipment Deployed Successfully",
          description: `Equipment assigned and fully integrated with RADIUS, billing, and monitoring systems.`,
        });
      } else {
        toast({
          title: "Equipment Assigned",
          description: `Equipment has been assigned successfully.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error assigning equipment:', error);
      toast({
        title: "Assignment Failed",
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast({
        title: "Equipment Returned",
        description: "Equipment has been returned to inventory.",
      });
    },
    onError: (error) => {
      console.error('Error unassigning equipment:', error);
      toast({
        title: "Error",
        description: "Failed to return equipment. Please try again.",
        variant: "destructive",
      });
    },
  });
};
