
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useUserDeletion = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if there are multiple super-admin users
  const { data: superAdminCount } = useQuery({
    queryKey: ['super-admin-count'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'super_admin')
        .eq('is_active', true);

      if (error) throw error;
      return data.length;
    },
    enabled: profile?.role === 'super_admin',
  });

  const canDeleteUser = (userId: string, userRole: string) => {
    // Only super-admin can delete users
    if (profile?.role !== 'super_admin') {
      return false;
    }

    // If user is super-admin and there's only one super-admin, cannot delete
    if (userRole === 'super_admin' && superAdminCount === 1) {
      return false;
    }

    // Cannot delete yourself
    if (userId === profile?.id) {
      return false;
    }

    return true;
  };

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      if (profile?.role !== 'super_admin') {
        throw new Error('Only super administrators can delete users');
      }

      // Call edge function to delete user completely
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId }
      });

      if (error) {
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-count'] });
      toast({
        title: "User Deleted",
        description: "User account and all associated data have been permanently deleted.",
      });
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: "destructive",
      });
    },
  });

  return {
    deleteUser: deleteUserMutation.mutate,
    isDeletingUser: deleteUserMutation.isPending,
    canDeleteUser,
    superAdminCount,
  };
};
