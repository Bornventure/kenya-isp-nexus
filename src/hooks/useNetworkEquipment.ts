
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NetworkEquipment {
  id: string;
  name: string;
  equipment_type_id: string | null;
  inventory_item_id: string | null;
  ip_address: string;
  snmp_community: string;
  snmp_version: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  isp_company_id: string;
  equipment_types?: {
    name: string;
    brand: string;
    model: string;
    category: string;
  };
  inventory_items?: {
    name: string;
    type: string;
    serial_number: string;
  };
}

export const useNetworkEquipment = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: equipment = [], isLoading, error } = useQuery({
    queryKey: ['network-equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('network_equipment')
        .select(`
          *,
          equipment_types (
            name,
            brand,
            model,
            category
          ),
          inventory_items (
            name,
            type,
            serial_number
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
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
