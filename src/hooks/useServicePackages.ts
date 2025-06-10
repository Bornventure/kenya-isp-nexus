
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

  console.log('useServicePackages - user:', user?.id);
  console.log('useServicePackages - profile:', profile);
  console.log('useServicePackages - isp_company_id:', profile?.isp_company_id);

  const { data: servicePackages = [], isLoading, error } = useQuery({
    queryKey: ['service-packages', user?.id, profile?.isp_company_id],
    queryFn: async () => {
      console.log('Fetching service packages...');
      
      if (!user || !profile?.isp_company_id) {
        console.log('No user or isp_company_id, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .eq('is_active', true)
        .order('monthly_rate', { ascending: true });

      if (error) {
        console.error('Error fetching service packages:', error);
        throw error;
      }

      console.log('Fetched service packages:', data);
      return data as ServicePackage[];
    },
    enabled: !!user && !!profile?.isp_company_id,
  });

  console.log('useServicePackages - final result:', { servicePackages, isLoading, error });

  return {
    servicePackages,
    isLoading,
    error,
  };
};
