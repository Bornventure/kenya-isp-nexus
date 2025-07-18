
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useRealtimeUpdates = (clientId?: string) => {
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);

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
    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('Cleaning up existing realtime channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!clientId) return;

    console.log('Setting up real-time subscriptions for client:', clientId);

    // Create a unique channel name to avoid conflicts
    const channelName = `client-updates-${clientId}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
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
      });

    // Store reference before subscribing
    channelRef.current = channel;

    // Subscribe and handle status
    channel.subscribe((status) => {
      console.log('Client realtime subscription status:', status);
    });

    return () => {
      console.log('Cleaning up real-time subscriptions');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [clientId, invalidateQueries]);

  return { invalidateQueries };
};
