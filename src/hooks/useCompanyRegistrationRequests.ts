
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CompanyRegistrationRequest {
  id: string;
  company_name: string;
  contact_person_name: string;
  email: string;
  phone?: string;
  address?: string;
  county?: string;
  sub_county?: string;
  kra_pin?: string;
  ca_license_number?: string;
  requested_license_type: string;
  business_description?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  processed_by?: string;
  processed_at?: string;
}

export const useCompanyRegistrationRequests = () => {
  return useQuery({
    queryKey: ['company-registration-requests'],
    queryFn: async (): Promise<CompanyRegistrationRequest[]> => {
      const { data, error } = await supabase
        .from('company_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registration requests:', error);
        throw error;
      }

      return data || [];
    },
  });
};
