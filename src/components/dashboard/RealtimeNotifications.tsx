
import React, { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const RealtimeNotifications: React.FC = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!profile?.isp_company_id) return;

    console.log('Setting up realtime notifications for company:', profile.isp_company_id);

    // Clean up existing channel if it exists
    if (channelRef.current) {
      console.log('Cleaning up existing channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Create a unique channel name to avoid conflicts
    const channelName = `notifications-${profile.isp_company_id}-${Date.now()}`;
    
    // Create a single channel for all notifications
    const notificationsChannel = supabase
      .channel(channelName)
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
          
          try {
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
          } catch (error) {
            console.error('Error fetching client for payment notification:', error);
          }
        }
      )
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
          
          try {
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
          } catch (error) {
            console.error('Error fetching client for invoice notification:', error);
          }
        }
      );

    // Store reference before subscribing
    channelRef.current = notificationsChannel;

    // Subscribe to the channel
    notificationsChannel.subscribe((status) => {
      console.log('Realtime subscription status:', status);
    });

    return () => {
      console.log('Cleaning up realtime notifications');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.isp_company_id, toast]);

  return null; // This component only handles notifications, doesn't render anything
};

export default RealtimeNotifications;
