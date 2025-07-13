
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSuperAdminLicenseData = () => {
  return useQuery({
    queryKey: ['super-admin-license-data'],
    queryFn: async () => {
      // Get all ISP companies with their client counts
      const { data: companies, error: companiesError } = await supabase
        .from('isp_companies')
        .select(`
          *,
          client_count:clients(count)
        `);

      if (companiesError) throw companiesError;

      // Process the data
      const totalCompanies = companies?.length || 0;
      const activeCompanies = companies?.filter(c => c.is_active).length || 0;
      
      let totalClients = 0;
      let companiesNearLimit = 0;
      const licenseDistribution: any = {
        starter: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 },
        professional: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 },
        enterprise: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 }
      };

      const licensePricing = {
        starter: 29,
        professional: 99,
        enterprise: 299
      };

      companies?.forEach(company => {
        const clientCount = Array.isArray(company.client_count) 
          ? company.client_count.length 
          : 0;
        
        totalClients += clientCount;
        
        const usagePercentage = company.client_limit > 0 
          ? (clientCount / company.client_limit) * 100 
          : 0;
        
        if (usagePercentage >= 80) {
          companiesNearLimit++;
        }

        const licenseType = company.license_type as keyof typeof licenseDistribution;
        if (licenseDistribution[licenseType]) {
          licenseDistribution[licenseType].count++;
          licenseDistribution[licenseType].totalClients += clientCount;
          licenseDistribution[licenseType].revenue += licensePricing[licenseType];
        }
      });

      // Calculate average usage for each license type
      Object.keys(licenseDistribution).forEach(type => {
        const typeData = licenseDistribution[type];
        if (typeData.count > 0) {
          // Calculate average usage across all companies of this type
          const totalUsage = companies
            ?.filter(c => c.license_type === type)
            .reduce((sum, company) => {
              const clientCount = Array.isArray(company.client_count) 
                ? company.client_count.length 
                : 0;
              const usage = company.client_limit > 0 
                ? (clientCount / company.client_limit) * 100 
                : 0;
              return sum + usage;
            }, 0) || 0;
          
          typeData.avgUsage = Math.round(totalUsage / typeData.count);
        }
      });

      const monthlyRevenue = Object.values(licenseDistribution)
        .reduce((sum: number, type: any) => sum + type.revenue, 0);

      return {
        totalCompanies,
        activeCompanies,
        totalClients,
        companiesNearLimit,
        licenseDistribution,
        revenueMetrics: {
          monthly: monthlyRevenue,
          growth: 12 // This could be calculated based on historical data
        }
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
