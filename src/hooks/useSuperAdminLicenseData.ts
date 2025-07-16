
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatKenyanCurrency } from '@/utils/currencyFormat';

export const useSuperAdminLicenseData = () => {
  return useQuery({
    queryKey: ['super-admin-license-data'],
    queryFn: async () => {
      // Get all ISP companies with their client counts and license types
      const { data: companies, error: companiesError } = await supabase
        .from('isp_companies')
        .select(`
          *,
          client_count:clients(count)
        `);

      if (companiesError) throw companiesError;

      // Get license types with pricing
      const { data: licenseTypes, error: licenseTypesError } = await supabase
        .from('license_types')
        .select('name, price, client_limit');

      if (licenseTypesError) throw licenseTypesError;

      // Create pricing lookup
      const licensePricing: Record<string, number> = {};
      licenseTypes?.forEach(type => {
        licensePricing[type.name] = type.price || 0;
      });

      // Process the data
      const totalCompanies = companies?.length || 0;
      const activeCompanies = companies?.filter(c => c.is_active).length || 0;
      
      let totalClients = 0;
      let companiesNearLimit = 0;
      let totalAnnualRevenue = 0;
      
      const licenseDistribution: Record<string, {
        count: number;
        totalClients: number;
        revenue: number;
        avgUsage: number;
      }> = {
        starter: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 },
        professional: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 },
        enterprise: { count: 0, totalClients: 0, revenue: 0, avgUsage: 0 }
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

        const licenseType = company.license_type as string;
        const annualPrice = licensePricing[licenseType] || 0;
        
        // Only count revenue from active companies
        if (company.is_active) {
          totalAnnualRevenue += annualPrice;
        }
        
        if (licenseDistribution[licenseType]) {
          licenseDistribution[licenseType].count++;
          licenseDistribution[licenseType].totalClients += clientCount;
          
          // Only add to revenue if company is active
          if (company.is_active) {
            licenseDistribution[licenseType].revenue += annualPrice;
          }
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

      // Calculate monthly revenue (annual / 12)
      const monthlyRevenue = totalAnnualRevenue / 12;

      return {
        totalCompanies,
        activeCompanies,
        totalClients,
        companiesNearLimit,
        licenseDistribution,
        revenueMetrics: {
          monthly: monthlyRevenue,
          annual: totalAnnualRevenue,
          growth: 12 // This could be calculated based on historical data
        }
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
