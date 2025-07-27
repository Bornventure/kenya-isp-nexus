
import { supabase } from '@/integrations/supabase/client';
import { ServicePackage } from '@/types/client';

class ServicePackageService {
  async getServicePackages(): Promise<ServicePackage[]> {
    try {
      const { data, error } = await supabase
        .from('service_packages')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching service packages:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Service package fetch error:', error);
      return [];
    }
  }
}

export const servicePackageService = new ServicePackageService();
