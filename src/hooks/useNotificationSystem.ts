
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface NotificationPayload {
  type: 'ticket_assigned' | 'ticket_status_changed' | 'ticket_escalated' | 'sla_warning';
  recipients: string[];
  ticket_id: string;
  message: string;
  channels: ('email' | 'sms' | 'whatsapp')[];
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export const useNotificationSystem = () => {
  const { toast } = useToast();

  const sendNotification = useMutation({
    mutationFn: async (payload: NotificationPayload) => {
      const { data, error } = await supabase.functions.invoke('send-ticket-notifications', {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification Sent",
        description: "Notification has been sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Notification Failed",
        description: "Failed to send notification",
        variant: "destructive",
      });
      console.error('Error sending notification:', error);
    },
  });

  const scheduleReminder = useMutation({
    mutationFn: async ({ ticket_id, reminder_time }: { ticket_id: string; reminder_time: string }) => {
      const { data, error } = await supabase.functions.invoke('schedule-reminder', {
        body: { ticket_id, reminder_time },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Reminder Scheduled",
        description: "Follow-up reminder has been scheduled",
      });
    },
  });

  return { sendNotification, scheduleReminder };
};
