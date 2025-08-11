
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NetworkEquipment {
  id: string;
  type: string;
  brand: string | null;
  model: string | null;
  serial_number: string;
  mac_address: string | null;
  ip_address: string | null;
  snmp_community: string | null;
  snmp_version: number | null;
  status: string | null;
  notes: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  isp_company_id: string | null;
  equipment_type_id: string | null;
  equipment_types?: {
    name: string;
    brand: string;
    model: string;
    device_type: string;
  };
  inventory_items?: {
    name: string;
    type: string;
    serial_number: string;
  };
}

export const useNetworkEquipment = () => {
  const { profile } = useAuth();

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['network-equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_types (
            name,
            brand,
            model,
            device_type
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching network equipment:', error);
        throw error;
      }

      return data as NetworkEquipment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  return {
    equipment,
    isLoading,
    error
  };
};
