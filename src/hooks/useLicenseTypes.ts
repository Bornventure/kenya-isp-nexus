
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LicenseType {
  id: string;
  name: string;
  display_name: string;
  description: string;
  price: number;
  client_limit: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLicenseTypes = () => {
  return useQuery({
    queryKey: ['license-types'],
    queryFn: async (): Promise<LicenseType[]> => {
      // For now, return mock data since we don't have a license_types table
      // This would be replaced with actual Supabase query when the table exists
      return [
        {
          id: '1',
          name: 'starter',
          display_name: 'Starter',
          description: 'Perfect for small ISPs getting started',
          price: 15000,
          client_limit: 50,
          features: ['Basic client management', 'Email support', 'Standard reporting'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'professional',
          display_name: 'Professional',
          description: 'For growing ISPs with advanced needs',
          price: 45000,
          client_limit: 200,
          features: ['Advanced client management', 'Priority support', 'Advanced reporting', 'API access'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'enterprise',
          display_name: 'Enterprise',
          description: 'For large ISPs with custom requirements',
          price: 100000,
          client_limit: 1000,
          features: ['Full feature access', '24/7 support', 'Custom integrations', 'White labeling'],
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    },
  });
};
