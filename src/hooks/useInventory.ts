
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface InventoryItem {
  id: string;
  item_id: string;
  category: string;
  type: string;
  name?: string;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  mac_address?: string;
  purchase_date?: string;
  warranty_expiry_date?: string;
  supplier?: string;
  cost?: number;
  location?: string;
  status: string;
  assigned_customer_id?: string;
  assigned_device_id?: string;
  assignment_date?: string;
  notes?: string;
  location_start_lat?: number;
  location_start_lng?: number;
  location_end_lat?: number;
  location_end_lng?: number;
  length_meters?: number;
  capacity?: string;
  installation_date?: string;
  last_maintenance_date?: string;
  ip_address?: string;
  subnet_mask?: string;
  item_sku?: string;
  quantity_in_stock?: number;
  reorder_level?: number;
  unit_cost?: number;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
    email: string;
  };
}

export interface InventoryHistory {
  id: string;
  action: string;
  details: string;
  created_at: string;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

export const useInventoryItems = (filters?: { category?: string; status?: string; search?: string }) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-items', profile?.isp_company_id, filters],
    queryFn: async () => {
      if (!profile?.isp_company_id) throw new Error('No company ID');

      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          clients:assigned_customer_id(name, email)
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,model.ilike.%${filters.search}%,serial_number.ilike.%${filters.search}%,item_id.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

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
          clients:assigned_customer_id(name, email)
        `)
        .eq('id', itemId)
        .eq('isp_company_id', profile?.isp_company_id)
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!itemId && !!profile?.isp_company_id,
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
          profiles:performed_by(first_name, last_name)
        `)
        .eq('inventory_item_id', itemId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryHistory[];
    },
    enabled: !!itemId,
  });
};

export const useInventoryStats = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['inventory-stats', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) throw new Error('No company ID');

      const { data, error } = await supabase
        .from('inventory_items')
        .select('status, category')
        .eq('isp_company_id', profile.isp_company_id);

      if (error) throw error;

      const stats = {
        total: data.length,
        inStock: data.filter(item => item.status === 'In Stock').length,
        deployed: data.filter(item => item.status === 'Deployed' || item.status === 'Live/Deployed').length,
        maintenance: data.filter(item => item.status === 'Maintenance').length,
        byCategory: {} as Record<string, number>,
      };

      data.forEach(item => {
        stats.byCategory[item.category] = (stats.byCategory[item.category] || 0) + 1;
      });

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
      if (!profile?.isp_company_id) throw new Error('No company ID');

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('category', 'Consumable')
        .not('quantity_in_stock', 'is', null)
        .not('reorder_level', 'is', null);

      if (error) throw error;

      return data.filter(item => 
        item.quantity_in_stock !== null && 
        item.reorder_level !== null && 
        item.quantity_in_stock <= item.reorder_level
      ) as InventoryItem[];
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (itemData: Omit<InventoryItem, 'id' | 'item_id' | 'created_at' | 'updated_at' | 'isp_company_id' | 'clients'>) => {
      if (!profile?.isp_company_id) throw new Error('No company ID');

      // Remove item_id since it's auto-generated by the database trigger
      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          category: itemData.category,
          type: itemData.type,
          name: itemData.name,
          manufacturer: itemData.manufacturer,
          model: itemData.model,
          serial_number: itemData.serial_number,
          mac_address: itemData.mac_address,
          purchase_date: itemData.purchase_date,
          warranty_expiry_date: itemData.warranty_expiry_date,
          supplier: itemData.supplier,
          cost: itemData.cost,
          location: itemData.location,
          status: itemData.status,
          notes: itemData.notes,
          location_start_lat: itemData.location_start_lat,
          location_start_lng: itemData.location_start_lng,
          location_end_lat: itemData.location_end_lat,
          location_end_lng: itemData.location_end_lng,
          length_meters: itemData.length_meters,
          capacity: itemData.capacity,
          installation_date: itemData.installation_date,
          last_maintenance_date: itemData.last_maintenance_date,
          ip_address: itemData.ip_address,
          subnet_mask: itemData.subnet_mask,
          item_sku: itemData.item_sku,
          quantity_in_stock: itemData.quantity_in_stock,
          reorder_level: itemData.reorder_level,
          unit_cost: itemData.unit_cost,
          isp_company_id: profile.isp_company_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      toast.success('Inventory item created successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to create inventory item: ' + error.message);
    },
  });
};

export const useUpdateInventoryItem = () => {
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
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
      toast.success('Inventory item updated successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to update inventory item: ' + error.message);
    },
  });
};

export const useAssignEquipmentToClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, clientId }: { itemId: string; clientId: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          status: 'Deployed',
          assigned_customer_id: clientId,
          assignment_date: new Date().toISOString(),
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Equipment assigned to client successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to assign equipment: ' + error.message);
    },
  });
};

export const useUnassignEquipmentFromClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update({
          status: 'Returned',
          assigned_customer_id: null,
          assignment_date: null,
        })
        .eq('id', itemId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Equipment unassigned successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to unassign equipment: ' + error.message);
    },
  });
};
