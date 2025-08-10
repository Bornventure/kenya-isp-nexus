
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTemplateDeletion = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: string) => {
      console.log('Deleting notification template:', templateId);

      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        throw error;
      }

      return templateId;
    },
    onSuccess: (templateId) => {
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      toast({
        title: "Template Deleted",
        description: "Notification template has been deleted successfully.",
      });
      console.log('Template deletion completed for:', templateId);
    },
    onError: (error, templateId) => {
      console.error('Error deleting template:', templateId, error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete template. Please try again.',
        variant: "destructive",
      });
    },
  });

  return {
    deleteTemplate: deleteTemplateMutation.mutate,
    isDeletingTemplate: deleteTemplateMutation.isPending,
  };
};
