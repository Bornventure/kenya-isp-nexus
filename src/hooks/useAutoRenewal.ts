
import { useEffect } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoRenewal = () => {
  const { client, refreshClientData } = useClientAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!client) return;

    const checkAndRenewSubscription = async () => {
      try {
        const currentClient = client;

        if (!currentClient) {
          console.log('No client data available for auto-renewal check');
          return;
        }

        // CRITICAL FIX: Check if service is already active and not expired
        const now = new Date();
        const subscriptionEndDate = currentClient.subscription_end_date ? new Date(currentClient.subscription_end_date) : null;
        const isServiceActive = currentClient.status === 'active' && subscriptionEndDate && subscriptionEndDate > now;

        if (isServiceActive) {
          console.log('Service is already active and not expired, skipping auto-renewal');
          return;
        }

        // Check if client has sufficient balance for renewal
        const monthlyRate = currentClient.monthly_rate || 0;
        const walletBalance = currentClient.wallet_balance || 0;

        if (walletBalance >= monthlyRate) {
          // Only renew if service is expired or suspended
          const needsRenewal = currentClient.status === 'suspended' || !subscriptionEndDate || subscriptionEndDate <= now;

          if (needsRenewal) {
            console.log('Attempting automatic renewal for client:', currentClient.name);
            
            const { data: renewalResult, error: renewalError } = await supabase
              .rpc('process_subscription_renewal', {
                p_client_id: currentClient.id
              });

            if (renewalError) {
              console.error('Renewal error:', renewalError);
              return;
            }

            if (renewalResult && typeof renewalResult === 'object' && 'success' in renewalResult) {
              const result = renewalResult as { success: boolean; message?: string; remaining_balance?: number };
              
              if (result.success) {
                toast({
                  title: "Subscription Renewed",
                  description: `Your subscription has been automatically renewed. Remaining balance: KES ${result.remaining_balance?.toFixed(2) || '0.00'}`,
                });
                
                await refreshClientData();
              }
            }
          }
        } else {
          console.log('Insufficient balance for auto-renewal:', {
            current: walletBalance,
            required: monthlyRate,
            shortfall: monthlyRate - walletBalance
          });
        }
      } catch (error) {
        console.error('Auto-renewal check error:', error);
      }
    };

    // Check immediately
    checkAndRenewSubscription();

    // Set up interval to check every 2 minutes
    const interval = setInterval(checkAndRenewSubscription, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [client, refreshClientData, toast]);
};
