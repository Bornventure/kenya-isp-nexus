
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
  networkUptime: number;
  averageResponseTime: string;
  totalHotspots: number;
  activeHotspots: number;
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

export interface TicketAnalytics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  avgResolutionTime: number;
  ticketsByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  ticketsByDepartment: Array<{
    department: string;
    count: number;
  }>;
}

class AnalyticsService {
  async getDashboardStats(ispCompanyId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get client statistics
      const { data: clientStats } = await supabase
        .from('clients')
        .select('status, monthly_rate, wallet_balance')
        .eq('isp_company_id', ispCompanyId);

      // Get support ticket statistics
      const { data: ticketStats } = await supabase
        .from('support_tickets')
        .select('status, created_at, resolved_at')
        .eq('isp_company_id', ispCompanyId);

      // Get equipment statistics
      const { data: equipmentStats } = await supabase
        .from('equipment')
        .select('status')
        .eq('isp_company_id', ispCompanyId);

      // Get hotspot statistics
      const { data: hotspotStats } = await supabase
        .from('hotspots')
        .select('status')
        .eq('isp_company_id', ispCompanyId);

      // Get payment statistics for current month
      const currentMonth = new Date().toISOString().slice(0, 7);
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
      
      const openTickets = ticketStats?.filter(t => t.status === 'open').length || 0;
      const inProgressTickets = ticketStats?.filter(t => t.status === 'in_progress').length || 0;
      const resolvedTickets = ticketStats?.filter(t => t.status === 'resolved').length || 0;
      const pendingTickets = openTickets + inProgressTickets;
      
      const totalEquipment = equipmentStats?.length || 0;
      const availableEquipment = equipmentStats?.filter(e => e.status === 'available').length || 0;
      
      const totalHotspots = hotspotStats?.length || 0;
      const activeHotspots = hotspotStats?.filter(h => h.status === 'active').length || 0;

      // Calculate average response time from resolved tickets
      const resolvedTicketsWithTimes = ticketStats?.filter(t => 
        t.status === 'resolved' && t.resolved_at && t.created_at
      ) || [];
      
      let avgResponseTime = 0;
      if (resolvedTicketsWithTimes.length > 0) {
        const totalResponseTime = resolvedTicketsWithTimes.reduce((sum, ticket) => {
          const created = new Date(ticket.created_at).getTime();
          const resolved = new Date(ticket.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0);
        avgResponseTime = totalResponseTime / resolvedTicketsWithTimes.length / (1000 * 60 * 60); // Convert to hours
      }

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
        networkUptime: 99.2, // This would come from actual network monitoring
        averageResponseTime: `${avgResponseTime.toFixed(1)}h`,
        totalHotspots,
        activeHotspots,
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

  async getClientGrowthData(ispCompanyId: string, months: number = 12): Promise<ApiResponse<ClientGrowthData[]>> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: clients } = await supabase
        .from('clients')
        .select('created_at')
        .eq('isp_company_id', ispCompanyId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true });

      // Group clients by month
      const clientsByMonth: { [key: string]: number } = {};
      
      clients?.forEach(client => {
        const month = new Date(client.created_at || '').toISOString().slice(0, 7);
        clientsByMonth[month] = (clientsByMonth[month] || 0) + 1;
      });

      // Calculate cumulative totals
      let cumulativeTotal = 0;
      const growthData: ClientGrowthData[] = Object.entries(clientsByMonth).map(([month, newClients]) => {
        cumulativeTotal += newClients;
        return {
          month,
          new_clients: newClients,
          total_clients: cumulativeTotal,
        };
      });

      return {
        data: growthData,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching client growth data:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }

  async getTicketAnalytics(ispCompanyId: string): Promise<ApiResponse<TicketAnalytics>> {
    try {
      const { data: tickets } = await supabase
        .from('support_tickets')
        .select(`
          status,
          priority,
          created_at,
          resolved_at,
          departments(name)
        `)
        .eq('isp_company_id', ispCompanyId);

      const totalTickets = tickets?.length || 0;
      const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
      const inProgressTickets = tickets?.filter(t => t.status === 'in_progress').length || 0;
      const resolvedTickets = tickets?.filter(t => t.status === 'resolved').length || 0;

      // Calculate average resolution time
      const resolvedWithTimes = tickets?.filter(t => 
        t.status === 'resolved' && t.resolved_at && t.created_at
      ) || [];
      
      let avgResolutionTime = 0;
      if (resolvedWithTimes.length > 0) {
        const totalTime = resolvedWithTimes.reduce((sum, ticket) => {
          const created = new Date(ticket.created_at).getTime();
          const resolved = new Date(ticket.resolved_at).getTime();
          return sum + (resolved - created);
        }, 0);
        avgResolutionTime = totalTime / resolvedWithTimes.length / (1000 * 60 * 60); // Hours
      }

      // Group by priority
      const ticketsByPriority = {
        high: tickets?.filter(t => t.priority === 'high').length || 0,
        medium: tickets?.filter(t => t.priority === 'medium').length || 0,
        low: tickets?.filter(t => t.priority === 'low').length || 0,
      };

      // Group by department
      const departmentCounts: { [key: string]: number } = {};
      tickets?.forEach(ticket => {
        const deptName = ticket.departments?.name || 'Unassigned';
        departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
      });

      const ticketsByDepartment = Object.entries(departmentCounts).map(([department, count]) => ({
        department,
        count,
      }));

      const analytics: TicketAnalytics = {
        totalTickets,
        openTickets,
        inProgressTickets,
        resolvedTickets,
        avgResolutionTime,
        ticketsByPriority,
        ticketsByDepartment,
      };

      return {
        data: analytics,
        error: null,
        success: true,
      };
    } catch (error) {
      console.error('Error fetching ticket analytics:', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
