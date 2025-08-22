
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

      // Get network admin users
      const { data: networkAdmins } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'network_admin')
        .eq('isp_company_id', client.isp_company_id);

      // Send notification to each network admin
      for (const admin of networkAdmins || []) {
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

      console.log('Network admin notifications sent for client:', clientId);
    } catch (error) {
      console.error('Error notifying network admin:', error);
    }
  }, []);

  const processRejection = useCallback(async (clientId: string, rejectionReason: string, rejectedBy: string) => {
    try {
      // Update client status
      await supabase
        .from('clients')
        .update({
          status: 'rejected',
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
      // Update client status
      await supabase
        .from('clients')
        .update({
          status: 'approved',
          approved_by: approvedBy,
          approved_at: new Date().toISOString()
        })
        .eq('id', clientId);

      // Assign equipment
      await supabase
        .from('equipment_assignments')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          assigned_by: approvedBy,
          isp_company_id: (await supabase.from('clients').select('isp_company_id').eq('id', clientId).single()).data?.isp_company_id
        });

      // Generate installation invoice
      await supabase.functions.invoke('generate-installation-invoice', {
        body: { client_id: clientId }
      });

      toast({
        title: "Client Approved",
        description: "Installation invoice has been generated.",
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

      // Send activation SMS
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: clientId,
          type: 'service_activation',
          data: {
            activation_date: new Date().toISOString()
          }
        }
      });

      console.log('Client service activated:', clientId);
    } catch (error) {
      console.error('Error activating client service:', error);
    }
  }, []);

  return {
    notifyNetworkAdmin,
    processRejection,
    processApproval,
    activateClientService
  };
};
