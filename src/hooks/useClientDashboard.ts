
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';
import { parseAmount } from '@/utils/currencyFormat';

interface ClientDashboardData {
  client: any;
  payments: any[];
  wallet_transactions: any[];
  pending_invoices: any[];
  recent_invoices: any[];
  support_tickets: any[];
  summary: {
    total_payments: number;
    pending_invoices_count: number;
    open_tickets: number;
    current_balance: number;
    monthly_rate: number;
  };
}

export const useClientDashboard = (clientEmail: string) => {
  const [data, setData] = useState<ClientDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const channelRef = useRef<any>(null);

  const fetchDashboardData = useCallback(async (email: string) => {
    if (!email) return;

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching dashboard data for client:', email);
      
      const { data: result, error: fetchError } = await supabase.functions.invoke('client-dashboard-data', {
        body: { client_email: email }
      });

      if (fetchError) {
        console.error('Dashboard data fetch error:', fetchError);
        throw new Error(fetchError.message || 'Failed to fetch dashboard data');
      }

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      // Parse and fix amount formatting issues
      const dashboardData = result.data;
      if (dashboardData.payments) {
        dashboardData.payments = dashboardData.payments.map((payment: any) => ({
          ...payment,
          amount: parseAmount(payment.amount)
        }));
      }

      if (dashboardData.wallet_transactions) {
        dashboardData.wallet_transactions = dashboardData.wallet_transactions.map((transaction: any) => ({
          ...transaction,
          amount: parseAmount(transaction.amount)
        }));
      }

      if (dashboardData.recent_invoices) {
        dashboardData.recent_invoices = dashboardData.recent_invoices.map((invoice: any) => ({
          ...invoice,
          amount: parseAmount(invoice.amount),
          total_amount: parseAmount(invoice.total_amount),
          vat_amount: parseAmount(invoice.vat_amount)
        }));
      }

      if (dashboardData.summary) {
        dashboardData.summary.total_payments = parseAmount(dashboardData.summary.total_payments);
        dashboardData.summary.current_balance = parseAmount(dashboardData.summary.current_balance);
        dashboardData.summary.monthly_rate = parseAmount(dashboardData.summary.monthly_rate);
      }

      console.log('Dashboard data loaded:', dashboardData);
      setData(dashboardData);
      
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Set up real-time updates
  const { invalidateQueries } = useRealtimeUpdates(data?.client?.id);

  // Initial fetch
  useEffect(() => {
    if (clientEmail) {
      fetchDashboardData(clientEmail);
    }
  }, [clientEmail, fetchDashboardData]);

  // Real-time subscription effect
  useEffect(() => {
    if (!data?.client?.id || !clientEmail) return;

    // Clean up existing channel
    if (channelRef.current) {
      console.log('Cleaning up existing dashboard subscription');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    console.log('Setting up realtime subscription for dashboard updates');
    
    // Create unique channel name
    const channelName = `dashboard-updates-${data.client.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `client_id=eq.${data.client.id}`
      }, () => {
        console.log('Payment update detected, refreshing dashboard data');
        fetchDashboardData(clientEmail);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `client_id=eq.${data.client.id}`
      }, () => {
        console.log('Wallet transaction update detected, refreshing dashboard data');
        fetchDashboardData(clientEmail);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices',
        filter: `client_id=eq.${data.client.id}`
      }, () => {
        console.log('Invoice update detected, refreshing dashboard data');
        fetchDashboardData(clientEmail);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${data.client.id}`
      }, () => {
        console.log('Client update detected, refreshing dashboard data');
        fetchDashboardData(clientEmail);
      });

    // Store reference before subscribing
    channelRef.current = channel;
    
    channel.subscribe((status) => {
      console.log('Dashboard subscription status:', status);
    });

    return () => {
      console.log('Cleaning up dashboard realtime subscription');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [data?.client?.id, clientEmail, fetchDashboardData]);

  const refreshData = useCallback(() => {
    if (clientEmail) {
      fetchDashboardData(clientEmail);
    }
  }, [clientEmail, fetchDashboardData]);

  return {
    data,
    isLoading,
    error,
    refreshData
  };
};
