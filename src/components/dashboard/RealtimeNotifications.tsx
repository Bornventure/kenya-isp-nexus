
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';

const RealtimeNotifications: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile?.isp_company_id) return;

    // Listen for payment notifications
    const paymentsChannel = supabase
      .channel('payments-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'payments',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        async (payload) => {
          console.log('New payment received:', payload);
          
          // Get client details for the notification
          const { data: client } = await supabase
            .from('clients')
            .select('name')
            .eq('id', payload.new.client_id)
            .single();

          toast({
            title: "💰 Payment Received!",
            description: `KES ${payload.new.amount} received from ${client?.name || 'Client'}`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Listen for new client registrations
    const clientsChannel = supabase
      .channel('clients-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'clients',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        (payload) => {
          console.log('New client registered:', payload);
          
          toast({
            title: "👋 New Client Registered!",
            description: `${payload.new.name} has joined your network`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    // Listen for subscription renewals (client status changes to active)
    const renewalsChannel = supabase
      .channel('renewals-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'clients',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        (payload) => {
          // Check if status changed to active (renewal)
          if (payload.old?.status !== 'active' && payload.new?.status === 'active') {
            console.log('Client subscription renewed:', payload);
            
            toast({
              title: "🔄 Subscription Renewed!",
              description: `${payload.new.name}'s service has been renewed and activated`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    // Listen for new invoices
    const invoicesChannel = supabase
      .channel('invoices-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'invoices',
          filter: `isp_company_id=eq.${profile.isp_company_id}`
        },
        async (payload) => {
          console.log('New invoice generated:', payload);
          
          // Get client details
          const { data: client } = await supabase
            .from('clients')
            .select('name')
            .eq('id', payload.new.client_id)
            .single();

          toast({
            title: "📄 Invoice Generated!",
            description: `Invoice ${payload.new.invoice_number} for ${client?.name || 'Client'} (KES ${payload.new.total_amount})`,
            duration: 5000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(paymentsChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(renewalsChannel);
      supabase.removeChannel(invoicesChannel);
    };
  }, [profile?.isp_company_id, toast]);

  return null; // This component only handles notifications, doesn't render anything
};

export default RealtimeNotifications;
