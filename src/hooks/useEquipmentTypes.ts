
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentType {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  created_at: string;
  isp_company_id: string;
}

export const useEquipmentTypes = () => {
  return useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      console.log('Fetching equipment types...');
      
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching equipment types:', error);
        throw error;
      }
      
      console.log('Equipment types fetched:', data);
      return data as EquipmentType[];
    },
  });
};
