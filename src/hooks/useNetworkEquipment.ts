
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface NetworkEquipment {
  id: string;
  type: string;
  brand?: string;
  model?: string;
  serial_number: string;
  mac_address?: string;
  ip_address?: string;
  status: string;
  location?: string;
  snmp_community?: string;
  snmp_version?: number;
  notes?: string;
  equipment_types?: {
    name: string;
  };
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useNetworkEquipment = () => {
  const { profile } = useAuth();

  const { data: equipment = [], isLoading, error, refetch } = useQuery({
    queryKey: ['network-equipment', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('equipment')
        .select(`
          *,
          equipment_types (
            name
          )
        `)
        .eq('isp_company_id', profile.isp_company_id)
        .eq('approval_status', 'approved')
        .in('status', ['available', 'assigned', 'deployed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching network equipment:', error);
        throw error;
      }

      return (data || []) as NetworkEquipment[];
    },
    enabled: !!profile?.isp_company_id,
  });

  return {
    equipment,
    isLoading,
    error,
    refetch
  };
};
