
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
        // Get current client data
        const { data: currentClient, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', client.id)
          .single();

        if (error || !currentClient) {
          console.error('Error fetching client data:', error);
          return;
        }

        // Check if client has sufficient balance for renewal
        const monthlyRate = currentClient.monthly_rate || 0;
        const walletBalance = currentClient.wallet_balance || 0;

        if (walletBalance >= monthlyRate) {
          // Calculate new subscription dates
          const now = new Date();
          const subscriptionEndDate = currentClient.subscription_type === 'weekly' 
            ? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            : new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000);

          // Check if renewal is needed (subscription ends within 1 day or has expired)
          const currentEndDate = currentClient.subscription_end_date ? new Date(currentClient.subscription_end_date) : null;
          const needsRenewal = !currentEndDate || currentEndDate <= new Date(now.getTime() + 24 * 60 * 60 * 1000);

          if (needsRenewal) {
            // Call the renewal function
            const { data: renewalResult, error: renewalError } = await supabase
              .rpc('process_subscription_renewal', {
                p_client_id: client.id
              });

            if (renewalError) {
              console.error('Renewal error:', renewalError);
              return;
            }

            // Check if renewal was successful
            if (renewalResult && typeof renewalResult === 'object' && 'success' in renewalResult) {
              const result = renewalResult as { success: boolean; message?: string; remaining_balance?: number };
              
              if (result.success) {
                toast({
                  title: "Subscription Renewed",
                  description: `Your subscription has been automatically renewed. Remaining balance: KES ${result.remaining_balance?.toFixed(2) || '0.00'}`,
                });
                
                // Refresh client data to update UI
                await refreshClientData();
              }
            }
          }
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
