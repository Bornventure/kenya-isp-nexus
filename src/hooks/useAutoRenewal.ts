
import { useEffect, useRef } from 'react';
import { useClientAuth } from '@/contexts/ClientAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useAutoRenewal = () => {
  const { client, refreshClientData } = useClientAuth();
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  const checkAndRenew = async () => {
    if (!client || isCheckingRef.current) return;
    
    isCheckingRef.current = true;
    
    try {
      console.log('Checking auto-renewal conditions for client:', client.name);
      
      const walletBalance = parseFloat(client.wallet_balance?.toString() || '0');
      const monthlyRate = parseFloat(client.monthly_rate?.toString() || '0');
      
      console.log('Wallet balance:', walletBalance, 'Monthly rate:', monthlyRate);
      
      // Check if wallet has sufficient balance for renewal
      if (walletBalance >= monthlyRate) {
        // Check if subscription is about to expire or has expired
        const now = new Date();
        const subscriptionEnd = client.subscription_end_date ? new Date(client.subscription_end_date) : null;
        
        if (subscriptionEnd) {
          const timeUntilExpiry = subscriptionEnd.getTime() - now.getTime();
          const hoursUntilExpiry = timeUntilExpiry / (1000 * 60 * 60);
          
          console.log('Hours until expiry:', hoursUntilExpiry);
          
          // Auto-renew if less than 24 hours remaining or already expired
          if (hoursUntilExpiry <= 24) {
            console.log('Attempting auto-renewal...');
            
            const { data, error } = await supabase.rpc('process_subscription_renewal', {
              p_client_id: client.id
            });
            
            if (error) {
              console.error('Auto-renewal failed:', error);
              return;
            }
            
            if (data?.success) {
              console.log('Auto-renewal successful:', data);
              
              // Calculate new subscription end date
              const renewalDate = new Date();
              const newEndDate = new Date(renewalDate);
              
              if (client.subscription_type === 'weekly') {
                newEndDate.setDate(renewalDate.getDate() + 7);
              } else {
                newEndDate.setDate(renewalDate.getDate() + 30); // Default to 30 days for monthly
              }
              
              toast({
                title: "Auto-Renewal Successful",
                description: `Your ${client.subscription_type || 'monthly'} subscription has been automatically renewed until ${newEndDate.toLocaleDateString()}`,
              });
              
              // Refresh client data to update UI
              await refreshClientData();
              
              // Send notification about successful renewal
              try {
                await supabase.functions.invoke('send-notifications', {
                  body: {
                    client_id: client.id,
                    type: 'subscription_renewed',
                    data: {
                      renewal_date: renewalDate.toISOString(),
                      new_end_date: newEndDate.toISOString(),
                      amount_deducted: monthlyRate,
                      remaining_balance: walletBalance - monthlyRate
                    }
                  }
                });
              } catch (notificationError) {
                console.error('Failed to send renewal notification:', notificationError);
              }
            } else {
              console.log('Auto-renewal conditions not met:', data);
            }
          }
        }
      } else {
        console.log('Insufficient balance for auto-renewal. Required:', monthlyRate, 'Available:', walletBalance);
      }
    } catch (error) {
      console.error('Error in auto-renewal check:', error);
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    if (client) {
      console.log('Setting up auto-renewal monitoring for client:', client.name);
      
      // Initial check
      checkAndRenew();
      
      // Set up interval to check every 2 minutes (120000ms)
      intervalRef.current = setInterval(checkAndRenew, 120000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [client?.id, client?.wallet_balance, client?.subscription_end_date]);

  return { checkAndRenew };
};
