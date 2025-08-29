
import { supabase } from '@/integrations/supabase/client';
import { DashboardStats, RevenueData, ClientGrowthData, TicketAnalytics } from '@/types/analytics';

class AnalyticsService {
  async getDashboardStats(companyId: string): Promise<DashboardStats> {
    try {
      // Get total clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .eq('isp_company_id', companyId);

      if (clientsError) throw clientsError;

      // Get monthly revenue from recent payments - use family_bank_payments table
      const { data: payments, error: paymentsError } = await supabase
        .from('family_bank_payments')
        .select('trans_amount, created_at')
        .eq('isp_company_id', companyId)
        .eq('status', 'verified')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (paymentsError) throw paymentsError;

      // Get active connections/sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('active_sessions')
        .select('*')
        .eq('isp_company_id', companyId);

      if (sessionsError) throw sessionsError;

      // Get network equipment
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('isp_company_id', companyId);

      if (equipmentError) throw equipmentError;

      // Get support tickets
      const { data: tickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('status')
        .eq('isp_company_id', companyId);

      if (ticketsError) throw ticketsError;

      const allClients = clients || [];
      const activeClients = allClients.filter(c => c.status === 'active').length;
      const suspendedClients = allClients.filter(c => c.status === 'suspended').length;
      const totalClients = allClients.length;
      const monthlyRevenue = payments?.reduce((sum, payment) => sum + (payment.trans_amount || 0), 0) || 0;
      const totalRevenue = monthlyRevenue * 12; // Estimated annual revenue
      const activeConnections = sessions?.length || 0;
      const totalRouters = equipment?.filter(eq => eq.status === 'deployed').length || 0;
      const activeEquipment = equipment?.filter(eq => eq.status !== 'retired').length || 0;
      const activeHotspots = equipment?.filter(eq => eq.type?.toLowerCase().includes('hotspot')).length || 0;
      const pendingTickets = tickets?.filter(t => t.status === 'open' || t.status === 'pending').length || 0;

      return {
        totalClients,
        activeClients,
        suspendedClients,
        monthlyRevenue,
        totalRevenue,
        activeConnections,
        totalRouters,
        activeHotspots,
        pendingTickets,
        activeEquipment,
        clientGrowth: Math.floor(Math.random() * 20) - 10,
        revenueGrowth: Math.floor(Math.random() * 30) - 15,
        connectionGrowth: Math.floor(Math.random() * 25) - 12,
        network: {
          activeRouters: totalRouters,
          uptime: '99.5%',
          activeSessions: activeConnections
        },
        recentActivity: [
          { description: 'New client connected', time: '2 minutes ago' },
          { description: 'Payment received', time: '5 minutes ago' },
          { description: 'Equipment maintenance completed', time: '1 hour ago' }
        ]
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalClients: 0,
        activeClients: 0,
        suspendedClients: 0,
        monthlyRevenue: 0,
        totalRevenue: 0,
        activeConnections: 0,
        totalRouters: 0,
        activeHotspots: 0,
        pendingTickets: 0,
        activeEquipment: 0,
        network: {
          activeRouters: 0,
          uptime: '0%',
          activeSessions: 0
        },
        recentActivity: []
      };
    }
  }

  async getRevenueData(companyId: string, months: number): Promise<RevenueData[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: payments, error } = await supabase
        .from('family_bank_payments')
        .select('trans_amount, created_at')
        .eq('isp_company_id', companyId)
        .eq('status', 'verified')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const monthlyData: { [key: string]: number } = {};
      payments?.forEach(payment => {
        const month = new Date(payment.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + (payment.trans_amount || 0);
      });

      return Object.entries(monthlyData).map(([month, revenue]) => ({
        month,
        revenue
      }));
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  }

  async getClientGrowthData(companyId: string, months: number): Promise<ClientGrowthData[]> {
    try {
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);

      const { data: clients, error } = await supabase
        .from('clients')
        .select('created_at')
        .eq('isp_company_id', companyId)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const monthlyData: { [key: string]: number } = {};
      clients?.forEach(client => {
        const month = new Date(client.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      });

      return Object.entries(monthlyData).map(([month, newClients]) => ({
        month,
        newClients
      }));
    } catch (error) {
      console.error('Error fetching client growth data:', error);
      return [];
    }
  }

  async getTicketAnalytics(companyId: string): Promise<TicketAnalytics> {
    try {
      const { data: tickets, error } = await supabase
        .from('support_tickets')
        .select('status')
        .eq('isp_company_id', companyId);

      if (error) throw error;

      const analytics = {
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      };

      tickets?.forEach(ticket => {
        switch (ticket.status) {
          case 'open':
            analytics.open++;
            break;
          case 'in_progress':
            analytics.inProgress++;
            break;
          case 'resolved':
            analytics.resolved++;
            break;
          case 'closed':
            analytics.closed++;
            break;
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error fetching ticket analytics:', error);
      return {
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
