
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUserActivation = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleUserActivationMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
        throw new Error('Insufficient permissions to manage user activation');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Status Updated",
        description: `User has been ${variables.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    },
    onError: (error) => {
      console.error('Error updating user activation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update user status',
        variant: "destructive",
      });
    },
  });

  return {
    toggleUserActivation: toggleUserActivationMutation.mutate,
    isUpdatingActivation: toggleUserActivationMutation.isPending,
  };
};
