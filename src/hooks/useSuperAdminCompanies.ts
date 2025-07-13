
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdminCompanies = () => {
  return useQuery({
    queryKey: ['super-admin-companies'],
    queryFn: async () => {
      // Get all ISP companies with their current client count
      const { data: companies, error } = await supabase
        .from('isp_companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get client counts for each company
      const companiesWithCounts = await Promise.all(
        companies?.map(async (company) => {
          const { count: clientCount } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })
            .eq('isp_company_id', company.id);

          return {
            ...company,
            current_client_count: clientCount || 0
          };
        }) || []
      );

      return companiesWithCounts;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
