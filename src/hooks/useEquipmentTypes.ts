
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EquipmentType {
  id: string;
  name: string;
  brand: string;
  model: string;
  device_type: string;
  default_config: any;
  snmp_settings: any;
  created_at: string;
  updated_at: string;
}

export const useEquipmentTypes = () => {
  const { data: equipmentTypes = [], isLoading, error } = useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_types')
        .select('*')
        .order('brand', { ascending: true });

      if (error) {
        console.error('Error fetching equipment types:', error);
        throw error;
      }

      return data as EquipmentType[];
    },
  });

  return {
    equipmentTypes,
    isLoading,
    error,
  };
};
