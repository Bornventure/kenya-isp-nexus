
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
  id: string;
  name?: string;
  type: string;
  category: string;
  quantity_in_stock: number;
  reorder_level: number;
  status: string;
  manufacturer?: string;
  model?: string;
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

        if (!data || !Array.isArray(data) || data.length === 0) {
          console.log('No data available, using fallback');
          return getDefaultCategories();
        }

        // Validate data structure
        const validRecords: Record<string, unknown>[] = [];
        for (const item of data) {
          if (item !== null && item !== undefined && isRecord(item)) {
            validRecords.push(item);
          }
        }
        
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
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['low-stock-items', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) {
        console.log('No ISP company ID, using fallback data');
        return getDefaultLowStockItems();
      }

      try {
        const { data, error } = await supabase
          .from('inventory_items')
          .select('*')
          .eq('isp_company_id', profile.isp_company_id)
          .not('quantity_in_stock', 'is', null)
          .not('reorder_level', 'is', null);

        if (error) {
          console.log('Database query failed, using fallback data:', error);
          return getDefaultLowStockItems();
        }

        if (!data || !Array.isArray(data)) {
          console.log('No data available, using fallback');
          return getDefaultLowStockItems();
        }

        // Filter items where quantity is less than or equal to reorder level
        const lowStockItems = data.filter(item => 
          item.quantity_in_stock !== null && 
          item.reorder_level !== null && 
          item.quantity_in_stock <= item.reorder_level
        );

        // If no real low stock items, return default ones for demo
        if (lowStockItems.length === 0) {
          console.log('No low stock items found, using fallback for demo');
          return getDefaultLowStockItems();
        }

        // Validate data structure
        const validRecords: Record<string, unknown>[] = [];
        for (const item of lowStockItems) {
          if (item !== null && item !== undefined && isRecord(item)) {
            validRecords.push(item);
          }
        }
        
        const isValidData = validRecords.every(item => 
          validateRequiredFields(item, [
            { key: 'id', type: 'string' },
            { key: 'type', type: 'string' },
            { key: 'category', type: 'string' }
          ])
        );
        
        if (isValidData && validRecords.length === lowStockItems.length) {
          return lowStockItems as unknown as LowStockItem[];
        }
        
        console.log('Invalid data structure, using fallback');
        return getDefaultLowStockItems();
      } catch (error) {
        console.error('Error fetching low stock items:', error);
        return getDefaultLowStockItems();
      }
    },
    enabled: !!profile?.isp_company_id,
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
      id: '1',
      name: 'MikroTik hEX S Router',
      type: 'Router',
      category: 'Routers',
      quantity_in_stock: 2,
      reorder_level: 5,
      status: 'In Stock',
      manufacturer: 'MikroTik',
      model: 'RB760iGS'
    },
    {
      id: '2', 
      name: 'Huawei ONT Device',
      type: 'ONT',
      category: 'ONT/CPE Devices',
      quantity_in_stock: 8,
      reorder_level: 25,
      status: 'In Stock',
      manufacturer: 'Huawei',
      model: 'HG8310M'
    },
    {
      id: '3',
      name: 'Ubiquiti Access Point',
      type: 'Access Point', 
      category: 'Access Points',
      quantity_in_stock: 3,
      reorder_level: 10,
      status: 'In Stock',
      manufacturer: 'Ubiquiti',
      model: 'UniFi AP AC Lite'
    },
    {
      id: '4',
      name: 'Ethernet Cables Cat6',
      type: 'Cable',
      category: 'Cables',
      quantity_in_stock: 45,
      reorder_level: 100,
      status: 'In Stock',
      manufacturer: 'Generic',
      model: 'Cat6 UTP'
    },
    {
      id: '5',
      name: 'Fiber Splice Enclosures',
      type: 'Enclosure',
      category: 'Fiber Equipment',
      quantity_in_stock: 1,
      reorder_level: 5,
      status: 'In Stock',
      manufacturer: 'CommScope',
      model: 'FOSC-24'
    }
  ];
}
