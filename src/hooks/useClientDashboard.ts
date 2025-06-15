
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

      console.log('Dashboard data loaded:', result.data);
      setData(result.data);
      
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

  // Initial fetch
  useEffect(() => {
    if (clientEmail) {
      fetchDashboardData(clientEmail);
    }
  }, [clientEmail, fetchDashboardData]);

  // Set up real-time subscription for payment updates
  useEffect(() => {
    if (!data?.client?.id) return;

    console.log('Setting up realtime subscription for payment updates');
    
    const channel = supabase
      .channel('dashboard-updates')
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
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
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
