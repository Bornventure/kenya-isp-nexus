
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isRecord, validateRequiredFields } from '@/lib/typeGuards';

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
      try {
        const { data, error } = await supabase
          .from('inventory_categories' as any)
          .select('*');

        if (error) {
          console.log('Database query failed, using fallback data:', error);
          return getDefaultCategories();
        }

        // Check if data exists and is an array before processing
        if (!data || !Array.isArray(data)) {
          console.log('No data or invalid data structure, using fallback');
          return getDefaultCategories();
        }

        if (data.length === 0) {
          console.log('Empty data array, using fallback');
          return getDefaultCategories();
        }

        // Filter out null/undefined items first
        const validRecords = data.filter(isRecord);
        
        // Validate each record has required fields
        const isValidData = validRecords.every(item => 
          validateRequiredFields(item, [
            { key: 'id', type: 'string' },
            { key: 'name', type: 'string' },
            { key: 'minimum_stock_level', type: 'number' }
          ])
        );
        
        if (isValidData && validRecords.length === data.length) {
          return data as unknown as InventoryCategory[];
        }
        
        console.log('Invalid data structure, using fallback');
        return getDefaultCategories();
      } catch (error) {
        console.error('Error fetching inventory categories:', error);
        return getDefaultCategories();
      }
    },
  });
};

export const useLowStockItems = () => {
  return useQuery({
    queryKey: ['low-stock-items'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('low_stock_view' as any)
          .select('*');

        if (error) {
          console.log('Database query failed, using fallback data:', error);
          return getDefaultLowStockItems();
        }

        // Check if data exists and is an array before processing
        if (!data || !Array.isArray(data)) {
          console.log('No data or invalid data structure, using fallback');
          return getDefaultLowStockItems();
        }

        if (data.length === 0) {
          console.log('Empty data array, using fallback');
          return getDefaultLowStockItems();
        }

        // Filter out null/undefined items first
        const validRecords = data.filter(isRecord);
        
        // Validate each record has required fields
        const isValidData = validRecords.every(item => 
          validateRequiredFields(item, [
            { key: 'category_name', type: 'string' },
            { key: 'minimum_stock_level', type: 'number' },
            { key: 'current_stock', type: 'number' }
          ])
        );
        
        if (isValidData && validRecords.length === data.length) {
          return data as unknown as LowStockItem[];
        }
        
        console.log('Invalid data structure, using fallback');
        return getDefaultLowStockItems();
      } catch (error) {
        console.error('Error fetching low stock items:', error);
        return getDefaultLowStockItems();
      }
    },
  });
};

function getDefaultCategories(): InventoryCategory[] {
  return [
    { id: '1', name: 'Routers', description: 'Network routing equipment', minimum_stock_level: 5, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '2', name: 'Switches', description: 'Network switching equipment', minimum_stock_level: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '3', name: 'Access Points', description: 'Wireless access points', minimum_stock_level: 10, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '4', name: 'ONT/CPE Devices', description: 'Customer premises equipment', minimum_stock_level: 25, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: '5', name: 'Fiber Optic Cables', description: 'Fiber optic cables for backbone', minimum_stock_level: 15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];
}

function getDefaultLowStockItems(): LowStockItem[] {
  return [
    {
      category_name: 'Routers',
      minimum_stock_level: 5,
      current_stock: 2,
      stock_shortage: 3,
      category_id: '1'
    },
    {
      category_name: 'ONT/CPE Devices',
      minimum_stock_level: 25,
      current_stock: 10,
      stock_shortage: 15,
      category_id: '4'
    },
    {
      category_name: 'Access Points',
      minimum_stock_level: 10,
      current_stock: 3,
      stock_shortage: 7,
      category_id: '3'
    }
  ];
}
