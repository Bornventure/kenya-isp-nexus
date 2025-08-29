
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsService } from '@/services/analyticsService';

export const useDashboardStats = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['dashboard-stats', profile?.isp_company_id],
    queryFn: () => analyticsService.getDashboardStats(profile?.isp_company_id || ''),
    enabled: !!profile?.isp_company_id,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
};

export const useRevenueData = (months: number = 12) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['revenue-data', profile?.isp_company_id, months],
    queryFn: async () => {
      const data = await analyticsService.getRevenueData(profile?.isp_company_id || '', months);
      return { data }; // Wrap in data property for chart components
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useClientGrowthData = (months: number = 12) => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['client-growth-data', profile?.isp_company_id, months],
    queryFn: async () => {
      const data = await analyticsService.getClientGrowthData(profile?.isp_company_id || '', months);
      return { data }; // Wrap in data property for chart components
    },
    enabled: !!profile?.isp_company_id,
  });
};

export const useTicketAnalytics = () => {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['ticket-analytics', profile?.isp_company_id],
    queryFn: async () => {
      const data = await analyticsService.getTicketAnalytics(profile?.isp_company_id || '');
      return { data }; // Wrap in data property for support stats component
    },
    enabled: !!profile?.isp_company_id,
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });
};
