
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface RejectionData {
  clientId: string;
  rejectionReason: string;
}

export const useClientRejection = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const rejectClient = useMutation({
    mutationFn: async ({ clientId, rejectionReason }: RejectionData) => {
      if (!profile?.id) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('clients')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          rejected_by: profile.id,
          rejected_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', clientId)
        .select()
        .single();

      if (error) {
        console.error('Client rejection error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Rejected",
        description: `Client application has been rejected successfully.`,
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting client:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject client application. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    rejectClient: rejectClient.mutate,
    isRejecting: rejectClient.isPending,
  };
};
