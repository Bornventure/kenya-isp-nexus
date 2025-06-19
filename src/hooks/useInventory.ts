
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
  status: string;
  quantity_in_stock: number;
  reorder_level?: number;
  unit_cost?: number;
  supplier?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
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
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    enabled: !!id,
  });
};
