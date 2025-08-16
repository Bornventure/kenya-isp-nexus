
import { supabase } from '@/integrations/supabase/client';
import { ServicePackage } from '@/types/client';

export class ServicePackageService {
  async getServicePackages(): Promise<ServicePackage[]> {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('is_active', true)
      .order('monthly_rate', { ascending: true });

    if (error) {
      console.error('Error fetching service packages:', error);
      throw error;
    }

    return data as ServicePackage[];
  }

  async getServicePackageById(id: string): Promise<ServicePackage | null> {
    const { data, error } = await supabase
      .from('service_packages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching service package:', error);
      return null;
    }

    return data as ServicePackage;
  }

  async createServicePackage(packageData: Omit<ServicePackage, 'id' | 'created_at' | 'updated_at'>): Promise<ServicePackage> {
    const { data, error } = await supabase
      .from('service_packages')
      .insert([packageData])
      .select()
      .single();

    if (error) {
      console.error('Error creating service package:', error);
      throw error;
    }

    return data as ServicePackage;
  }
}

export const servicePackageService = new ServicePackageService();
