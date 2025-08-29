
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWorkflowOrchestration = () => {
  const { toast } = useToast();

  const notifyNetworkAdmin = useCallback(async (clientId: string) => {
    try {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (!client) return;

      // Get network engineer users (using correct role)
      const { data: networkEngineers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'network_engineer')
        .eq('isp_company_id', client.isp_company_id);

      // Send notification to each network engineer
      for (const admin of networkEngineers || []) {
        await supabase.functions.invoke('send-notifications', {
          body: {
            user_id: admin.id,
            type: 'client_registration',
            title: 'New Client Registration',
            message: `New client registration pending approval: ${client.name}`,
            data: {
              client_id: clientId,
              client_name: client.name,
              client_email: client.email,
              client_phone: client.phone
            }
          }
        });
      }

      console.log('Network engineer notifications sent for client:', clientId);
    } catch (error) {
      console.error('Error notifying network engineer:', error);
    }
  }, []);

  const processRejection = useCallback(async (clientId: string, rejectionReason: string, rejectedBy: string) => {
    try {
      // Update client status to rejected
      await supabase
        .from('clients')
        .update({
          status: 'rejected' as const,
          rejection_reason: rejectionReason,
          rejected_by: rejectedBy,
          rejected_at: new Date().toISOString()
        })
        .eq('id', clientId);

      // Get client and sales person info
      const { data: client } = await supabase
        .from('clients')
        .select('*, profiles!submitted_by(*)')
        .eq('id', clientId)
        .single();

      if (client?.profiles) {
        // Notify sales person of rejection
        await supabase.functions.invoke('send-notifications', {
          body: {
            user_id: client.submitted_by,
            type: 'client_rejected',
            title: 'Client Registration Rejected',
            message: `Client registration for ${client.name} has been rejected. Reason: ${rejectionReason}`,
            data: {
              client_id: clientId,
              client_name: client.name,
              rejection_reason: rejectionReason
            }
          }
        });
      }

      toast({
        title: "Client Rejected",
        description: "Sales team has been notified of the rejection.",
      });
    } catch (error) {
      console.error('Error processing rejection:', error);
      toast({
        title: "Error",
        description: "Failed to process rejection.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const processApproval = useCallback(async (clientId: string, equipmentId: string, approvedBy: string) => {
    try {
      // Update client status to approved
      await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', clientId);

      // Generate installation invoice immediately after approval
      const { data: invoiceData, error: invoiceError } = await supabase.functions.invoke('generate-installation-invoice', {
        body: { client_id: clientId }
      });

      if (invoiceError) {
        console.error('Error generating installation invoice:', invoiceError);
        throw invoiceError;
      }

      console.log('Installation invoice generated:', invoiceData);

      toast({
        title: "Client Approved",
        description: "Installation invoice has been generated and sent to the client via SMS.",
      });
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: "Error",
        description: "Failed to process approval.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const activateClientService = useCallback(async (clientId: string) => {
    try {
      // Get client with service package details
      const { data: client } = await supabase
        .from('clients')
        .select('*, service_packages(*)')
        .eq('id', clientId)
        .single();

      if (!client) {
        throw new Error('Client not found');
      }

      // Use the existing client activation service
      const { data, error } = await supabase.functions.invoke('activate-client-service', {
        body: { client_id: clientId }
      });

      if (error) throw error;

      // Update client status to active
      await supabase
        .from('clients')
        .update({
          status: 'active',
          service_activated_at: new Date().toISOString(),
          subscription_start_date: new Date().toISOString(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq('id', clientId);

      // Send activation SMS using Celcomafrica
      await supabase.functions.invoke('send-sms', {
        body: {
          phone: client.phone,
          message: `Congratulations ${client.name}! Your internet service has been activated successfully. Welcome to our network! Your service package: ${client.service_packages?.name}`,
          gateway: 'celcomafrica'
        }
      });

      console.log('Client service activated:', clientId);

      toast({
        title: "Service Activated",
        description: "Client service has been activated successfully and SMS notification sent.",
      });
    } catch (error) {
      console.error('Error activating client service:', error);
      toast({
        title: "Error",
        description: "Failed to activate client service.",
        variant: "destructive",
      });
    }
  }, [toast]);

  return {
    notifyNetworkAdmin,
    processRejection,
    processApproval,
    activateClientService
  };
};
