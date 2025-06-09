
import { supabase } from '@/integrations/supabase/client';
import type { ApiResponse } from './apiService';

export interface DashboardStats {
  totalClients: number;
  activeClients: number;
  suspendedClients: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingTickets: number;
  resolvedTickets: number;
  totalEquipment: number;
  availableEquipment: number;
}

export interface RevenueData {
  month: string;
  revenue: number;
  clients: number;
}

export interface ClientGrowthData {
  month: string;
  new_clients: number;
  total_clients: number;
}

class AnalyticsService {
  async getDashboardStats(ispCompanyId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get client statistics
      const { data: clientStats } = await supabase
        .from('clients')
        .select('status, monthly_rate')
        .eq('isp_company_id', ispCompanyId);

      // Get support ticket statistics
      const { data: ticketStats } = await supabase
        .from('support_tickets')
        .select('status')
        .eq('isp_company_id', ispCompanyId);

      // Get equipment statistics
      const { data: equipmentStats } = await supabase
        .from('equipment')
        .select('status')
        .eq('isp_company_id', ispCompanyId);

      // Get payment statistics for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      const { data: paymentStats } = await supabase
        .from('payments')
        .select('amount')
        .eq('isp_company_id', ispCompanyId)
        .gte('payment_date', `${currentMonth}-01`)
        .lt('payment_date', `${currentMonth}-32`);

      // Calculate statistics
      const totalClients = clientStats?.length || 0;
      const activeClients = clientStats?.filter(c => c.status === 'active').length || 0;
      const suspendedClients = clientStats?.filter(c => c.status === 'suspended').length || 0;
      
      const totalRevenue = clientStats?.reduce((sum, client) => sum + (client.monthly_rate || 0), 0) || 0;
      const monthlyRevenue = paymentStats?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
      
      const pendingTickets = ticketStats?.filter(t => t.status === 'open' || t.status === 'in_progress').length || 0;
      const resolvedTickets = ticketStats?.filter(t => t.status === 'resolved').length || 0;
      
      const totalEquipment = equipmentStats?.length || 0;
      const availableEquipment = equipmentStats?.filter(e => e.status === 'available').length || 0;

      const stats: DashboardStats = {
        totalClients,
        activeClients,
        suspendedClients,
        totalRevenue,
        monthlyRevenue,
        pendingTickets,
        resolvedTickets,
        totalEquipment,
        availableEquipment,
      };

      return {
        data: stats,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async getRevenueData(ispCompanyId: string, months: number = 12): Promise<ApiResponse<RevenueData[]>> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: payments } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('isp_company_id', ispCompanyId)
        .gte('payment_date', startDate.toISOString())
        .order('payment_date', { ascending: true });

      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('isp_company_id', ispCompanyId)
        .gte('created_at', startDate.toISOString());

      // Group data by month
      const revenueByMonth: { [key: string]: { revenue: number; clients: number } } = {};

      payments?.forEach(payment => {
        const month = new Date(payment.payment_date || '').toISOString().slice(0, 7);
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = { revenue: 0, clients: 0 };
        }
        revenueByMonth[month].revenue += payment.amount;
      });

      clients?.forEach(client => {
        const month = new Date(client.created_at || '').toISOString().slice(0, 7);
        if (!revenueByMonth[month]) {
          revenueByMonth[month] = { revenue: 0, clients: 0 };
        }
        revenueByMonth[month].clients += 1;
      });

      const revenueData: RevenueData[] = Object.entries(revenueByMonth).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        clients: data.clients,
      }));

      return {
        data: revenueData,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
