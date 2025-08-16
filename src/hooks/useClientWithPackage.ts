
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client } from '@/types/client';
import { ServicePackage } from '@/types/client';

export const useClientWithPackage = (client: Client) => {
  const { data: servicePackage } = useQuery({
    queryKey: ['service-package', client.service_package_id],
    queryFn: async () => {
      if (!client.service_package_id) return null;

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', client.service_package_id)
        .single();

      if (error) {
        console.error('Error fetching service package:', error);
        return null;
      }

      return data as ServicePackage;
    },
    enabled: !!client.service_package_id,
  });

  return {
    ...client,
    service_packages: servicePackage,
  };
};
