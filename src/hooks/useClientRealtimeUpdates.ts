
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClientAuth } from '@/contexts/ClientAuthContext';

export const useClientRealtimeUpdates = () => {
  const { client, refreshClientData } = useClientAuth();
  const { toast } = useToast();

  const handleRealtimeUpdate = useCallback((table: string, payload: any) => {
    console.log(`Real-time update for ${table}:`, payload);
    
    switch (table) {
      case 'clients':
        if (payload.eventType === 'UPDATE') {
          // Refresh client data when client record is updated
          refreshClientData();
          
          // Show notification for status changes
          if (payload.old?.status !== payload.new?.status) {
            const statusMessage = payload.new.status === 'active' 
              ? 'Your service has been activated!' 
              : `Service status changed to ${payload.new.status}`;
            
            toast({
              title: "Service Update",
              description: statusMessage,
              duration: 5000,
            });
          }

          // Show notification for wallet balance changes
          if (payload.old?.wallet_balance !== payload.new?.wallet_balance) {
            const balanceChange = payload.new.wallet_balance - payload.old.wallet_balance;
            if (balanceChange > 0) {
              toast({
                title: "Wallet Credited",
                description: `KES ${balanceChange.toFixed(2)} has been added to your wallet`,
                duration: 5000,
              });
            }
          }
        }
        break;

      case 'invoices':
        if (payload.eventType === 'INSERT') {
          toast({
            title: "New Invoice",
            description: `Invoice ${payload.new.invoice_number} has been generated`,
            duration: 5000,
          });
        } else if (payload.eventType === 'UPDATE' && payload.old?.status !== payload.new?.status) {
          if (payload.new.status === 'paid') {
            toast({
              title: "Payment Confirmed",
              description: `Payment for invoice ${payload.new.invoice_number} has been confirmed`,
              duration: 5000,
            });
          }
        }
        break;

      case 'payments':
        if (payload.eventType === 'INSERT') {
          toast({
            title: "Payment Received",
            description: `Your payment of KES ${payload.new.amount} has been processed`,
            duration: 5000,
          });
        }
        break;

      case 'wallet_transactions':
        if (payload.eventType === 'INSERT') {
          if (payload.new.transaction_type === 'credit') {
            toast({
              title: "Wallet Credited",
              description: `KES ${payload.new.amount} has been added to your wallet`,
              duration: 5000,
            });
          }
        }
        break;
    }
  }, [refreshClientData, toast]);

  useEffect(() => {
    if (!client) return;

    const channels = [
      {
        name: 'client_updates',
        table: 'clients',
        filter: `id=eq.${client.id}`
      },
      {
        name: 'client_invoices',
        table: 'invoices',
        filter: `client_id=eq.${client.id}`
      },
      {
        name: 'client_payments',
        table: 'payments',
        filter: `client_id=eq.${client.id}`
      },
      {
        name: 'client_wallet_transactions',
        table: 'wallet_transactions',
        filter: `client_id=eq.${client.id}`
      }
    ];

    const subscriptions = channels.map(({ name, table, filter }) => 
      supabase
        .channel(name)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table,
            filter
          },
          (payload) => handleRealtimeUpdate(table, payload)
        )
        .subscribe()
    );

    return () => {
      subscriptions.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [client, handleRealtimeUpdate]);
};
