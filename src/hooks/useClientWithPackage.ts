
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Client, ServicePackage } from '@/types/client';

export const useClientWithPackage = (client: Client) => {
  const { data: servicePackage } = useQuery({
    queryKey: ['service-package', client.servicePackage || client.service_package_id],
    queryFn: async () => {
      const packageId = client.servicePackage || client.service_package_id;
      if (!packageId) return null;

      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', packageId)
        .single();

      if (error) {
        console.error('Error fetching service package:', error);
        return null;
      }

      return data as ServicePackage;
    },
    enabled: !!(client.servicePackage || client.service_package_id),
  });

  return {
    ...client,
    service_packages: servicePackage,
  };
};
