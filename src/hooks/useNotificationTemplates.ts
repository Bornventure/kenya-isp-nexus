
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface NotificationTemplate {
  id: string;
  name: string;
  category: string;
  trigger_event: string;
  subject?: string;
  message_template: string;
  variables: string[];
  is_active: boolean;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationTemplates = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['notification-templates', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('trigger_event', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map(item => ({
        ...item,
        variables: Array.isArray(item.variables) ? item.variables : []
      })) as NotificationTemplate[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateTemplate = useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<NotificationTemplate> 
    }) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template Updated",
        description: "Notification template has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const createTemplate = useMutation({
    mutationFn: async (templateData: Omit<NotificationTemplate, 'id' | 'created_at' | 'updated_at' | 'isp_company_id'>) => {
      const { data, error } = await supabase
        .from('notification_templates')
        .insert({
          ...templateData,
          variables: templateData.variables || [],
          isp_company_id: profile?.isp_company_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Template Created",
        description: "New notification template has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create template",
        variant: "destructive",
      });
    },
  });

  const sendBroadcast = useMutation({
    mutationFn: async ({ 
      message, 
      channels = ['sms'] 
    }: { 
      message: string; 
      channels?: string[] 
    }) => {
      // Get all active clients
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, name, email, phone')
        .eq('isp_company_id', profile?.isp_company_id)
        .eq('status', 'active');

      if (clientsError) throw clientsError;

      if (!clients || clients.length === 0) {
        throw new Error('No active clients found');
      }

      // Create broadcast log
      const recipients = clients.map(c => channels.includes('email') ? c.email : c.phone).filter(Boolean);
      
      const { error: logError } = await supabase
        .from('notification_logs')
        .insert({
          trigger_event: 'broadcast',
          type: 'broadcast',
          channels,
          recipients,
          message_content: message,
          status: 'sent',
          sent_at: new Date().toISOString(),
          isp_company_id: profile?.isp_company_id
        });

      if (logError) throw logError;

      // Here you would integrate with your SMS/Email service
      // For now, we'll just log the broadcast
      console.log('Broadcasting message to', clients.length, 'clients:', message);
    },
    onSuccess: (_, variables) => {
      toast({
        title: "Broadcast Sent",
        description: `Message has been broadcast via ${variables.channels.join(', ')}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Broadcast Failed",
        description: error.message || "Failed to send broadcast message",
        variant: "destructive",
      });
    },
  });

  return {
    templates,
    isLoading,
    updateTemplate: updateTemplate.mutate,
    createTemplate: createTemplate.mutate,
    sendBroadcast: sendBroadcast.mutate,
    isUpdating: updateTemplate.isPending,
    isCreating: createTemplate.isPending,
    isSending: sendBroadcast.isPending,
  };
};
