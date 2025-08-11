
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  minimum_stock_level: number;
  created_at: string;
  updated_at: string;
}

export interface LowStockItem {
  category_name: string;
  minimum_stock_level: number;
  current_stock: number;
  stock_shortage: number;
  category_id: string;
}

export const useInventoryCategories = () => {
  return useQuery({
    queryKey: ['inventory-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as InventoryCategory[];
    },
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('low_stock_view')
        .select('*')
        .order('stock_shortage', { ascending: false });

      if (error) throw error;
      return data as LowStockItem[];
    },
  });
};
