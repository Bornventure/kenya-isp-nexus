
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SMSTemplate {
  id: string;
  template_key: string;
  template_name: string;
  template_content: string;
  variables: string[];
  is_active: boolean;
  isp_company_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useSMSTemplates = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['sms-templates', profile?.isp_company_id],
    queryFn: async () => {
      if (!profile?.isp_company_id) return [];

      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('isp_company_id', profile.isp_company_id)
        .order('template_name');

      if (error) throw error;
      return data as SMSTemplate[];
    },
    enabled: !!profile?.isp_company_id,
  });

  const updateTemplate = useMutation({
    mutationFn: async ({
      id,
      template_content,
      is_active = true
    }: {
      id: string;
      template_content: string;
      is_active?: boolean;
    }) => {
      const { error } = await supabase
        .from('sms_templates')
        .update({
          template_content,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms-templates'] });
      toast({
        title: "Template Updated",
        description: "SMS template has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update SMS template.",
        variant: "destructive",
      });
    },
  });

  const sendBulkSMS = useMutation({
    mutationFn: async ({
      templateKey,
      recipients,
      variables = {}
    }: {
      templateKey: string;
      recipients: string[];
      variables?: Record<string, string>;
    }) => {
      const { error } = await supabase.functions.invoke('send-bulk-sms', {
        body: {
          template_key: templateKey,
          recipients,
          variables,
          isp_company_id: profile?.isp_company_id
        }
      });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: "SMS Sent",
        description: `Bulk SMS sent to ${variables.recipients.length} recipients.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send bulk SMS.",
        variant: "destructive",
      });
    },
  });

  return {
    templates,
    isLoading,
    updateTemplate: updateTemplate.mutate,
    isUpdatingTemplate: updateTemplate.isPending,
    sendBulkSMS: sendBulkSMS.mutate,
    isSendingBulkSMS: sendBulkSMS.isPending,
  };
};
