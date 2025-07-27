
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutoNotificationPayload {
  client_id: string;
  trigger_event: string;
  data: Record<string, any>;
  template_id?: string;
}

export const useAutoNotifications = () => {
  const { toast } = useToast();

  const sendAutoNotification = useMutation({
    mutationFn: async (payload: AutoNotificationPayload) => {
      const { data, error } = await supabase.functions.invoke('send-auto-notifications', {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      const successCount = data.results.filter((r: any) => r.success).length;
      const totalCount = data.results.length;
      
      toast({
        title: "Notifications Sent",
        description: `${successCount}/${totalCount} notifications sent successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Notification Failed",
        description: "Failed to send automatic notifications",
        variant: "destructive",
      });
      console.error('Auto notification error:', error);
    },
  });

  // Helper functions for common notification triggers
  const triggerPaymentConfirmation = (clientId: string, paymentData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'payment_received',
      data: {
        amount: paymentData.amount,
        receipt_number: paymentData.receipt_number,
        payment_method: paymentData.payment_method,
        expiry_date: paymentData.expiry_date,
        receipt_html: paymentData.receipt_html
      }
    });
  };

  const triggerServiceRenewal = (clientId: string, renewalData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'service_renewal',
      data: {
        package_name: renewalData.package_name,
        service_period_start: renewalData.service_period_start,
        service_period_end: renewalData.service_period_end,
        amount: renewalData.amount
      }
    });
  };

  const triggerPaymentReminder = (clientId: string, reminderData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'payment_reminder',
      data: {
        days_remaining: reminderData.days_remaining,
        amount: reminderData.amount,
        package_name: reminderData.package_name,
        paybill_number: reminderData.paybill_number,
        account_number: reminderData.account_number
      }
    });
  };

  const triggerAccountSetup = (clientId: string, setupData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'client_registration',
      data: {
        installation_date: setupData.installation_date,
        technician_name: setupData.technician_name,
        package_name: setupData.package_name
      }
    });
  };

  const triggerServiceSuspension = (clientId: string, suspensionData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'service_suspension',
      data: {
        amount: suspensionData.amount,
        due_date: suspensionData.due_date
      }
    });
  };

  const triggerPackageUpgrade = (clientId: string, upgradeData: any) => {
    return sendAutoNotification.mutate({
      client_id: clientId,
      trigger_event: 'package_upgrade',
      data: {
        package_name: upgradeData.new_package_name,
        old_package_name: upgradeData.old_package_name,
        amount: upgradeData.new_amount
      }
    });
  };

  const triggerNetworkMaintenance = (clientIds: string[], maintenanceData: any) => {
    clientIds.forEach(clientId => {
      sendAutoNotification.mutate({
        client_id: clientId,
        trigger_event: 'network_maintenance',
        data: {
          maintenance_date: maintenanceData.date,
          start_time: maintenanceData.start_time,
          end_time: maintenanceData.end_time,
          affected_areas: maintenanceData.affected_areas
        }
      });
    });
  };

  return {
    sendAutoNotification,
    triggerPaymentConfirmation,
    triggerServiceRenewal,
    triggerPaymentReminder,
    triggerAccountSetup,
    triggerServiceSuspension,
    triggerPackageUpgrade,
    triggerNetworkMaintenance
  };
};
