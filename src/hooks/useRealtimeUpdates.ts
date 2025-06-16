
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeUpdates = (clientId?: string) => {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['payments'] });
    queryClient.invalidateQueries({ queryKey: ['invoices'] });
    queryClient.invalidateQueries({ queryKey: ['clients'] });
    queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    if (clientId) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', clientId] });
    }
    console.log('Real-time update triggered - invalidating queries');
  }, [queryClient, clientId]);

  useEffect(() => {
    if (!clientId) return;

    console.log('Setting up real-time subscriptions for client:', clientId);

    const channel = supabase
      .channel('payment-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        console.log('Payment update detected:', payload);
        invalidateQueries();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'wallet_transactions',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        console.log('Wallet transaction update detected:', payload);
        invalidateQueries();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'invoices',
        filter: `client_id=eq.${clientId}`
      }, (payload) => {
        console.log('Invoice update detected:', payload);
        invalidateQueries();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clients',
        filter: `id=eq.${clientId}`
      }, (payload) => {
        console.log('Client update detected:', payload);
        invalidateQueries();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(channel);
    };
  }, [clientId, invalidateQueries]);

  return { invalidateQueries };
};
