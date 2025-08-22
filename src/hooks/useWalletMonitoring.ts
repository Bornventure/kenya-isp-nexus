
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWalletMonitoring = () => {
  const checkWalletBalances = useCallback(async () => {
    try {
      const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .eq('status', 'active')
        .not('subscription_end_date', 'is', null);

      for (const client of clients || []) {
        const daysUntilExpiry = Math.ceil(
          (new Date(client.subscription_end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send reminders based on days until expiry
        if ([3, 2, 1].includes(daysUntilExpiry)) {
          await supabase.functions.invoke('send-notifications', {
            body: {
              client_id: client.id,
              type: 'wallet_reminder',
              data: {
                days_until_expiry: daysUntilExpiry,
                current_balance: client.wallet_balance,
                required_amount: client.monthly_rate,
                package_name: 'Current Package'
              }
            }
          });
        }

        // Auto-renew if sufficient balance
        if (daysUntilExpiry === 0 && client.wallet_balance >= client.monthly_rate) {
          await supabase.rpc('process_subscription_renewal', {
            p_client_id: client.id
          });

          // Send renewal success notification
          await supabase.functions.invoke('send-notifications', {
            body: {
              client_id: client.id,
              type: 'renewal_success',
              data: {
                amount: client.monthly_rate,
                remaining_balance: client.wallet_balance - client.monthly_rate
              }
            }
          });
        }

        // Suspend service if expired and insufficient balance
        if (daysUntilExpiry < 0 && client.wallet_balance < client.monthly_rate) {
          await supabase
            .from('clients')
            .update({ status: 'suspended' })
            .eq('id', client.id);

          // Send suspension notification
          await supabase.functions.invoke('send-notifications', {
            body: {
              client_id: client.id,
              type: 'service_suspended',
              data: {
                suspension_date: new Date().toISOString(),
                required_amount: client.monthly_rate
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error checking wallet balances:', error);
    }
  }, []);

  // Check wallet balances every hour
  useEffect(() => {
    const interval = setInterval(checkWalletBalances, 60 * 60 * 1000);
    
    // Initial check
    checkWalletBalances();
    
    return () => clearInterval(interval);
  }, [checkWalletBalances]);

  return { checkWalletBalances };
};
