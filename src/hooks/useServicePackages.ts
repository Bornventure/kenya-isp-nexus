
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo } from 'react';

export interface ServicePackage {
  id: string;
  name: string;
  speed: string;
  monthly_rate: number;
  connection_types: string[];
  description: string | null;
  is_active: boolean;
}

export const useServicePackages = () => {
  const { user, profile } = useAuth();

  // Memoize the company ID to prevent unnecessary re-renders
  const companyId = useMemo(() => profile?.isp_company_id, [profile?.isp_company_id]);

  const { data: servicePackages = [], isLoading, error } = useQuery({
    queryKey: ['service-packages', companyId],
    queryFn: async () => {
      if (!user || !companyId) {
        return [];
      }

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', companyId)
        .eq('is_active', true)
        .order('monthly_rate', { ascending: true });

      if (error) {
        console.error('Error fetching service packages:', error);
        throw error;
      }

      return data as ServicePackage[];
    },
    enabled: !!user && !!companyId,
  });

  return {
    servicePackages,
    isLoading,
    error,
  };
};
