
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
    // Only super_admin and isp_admin can delete users
    if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
      return false;
    }

    // ISP admin can't delete super_admin users
    if (profile?.role === 'isp_admin' && userRole === 'super_admin') {
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
      if (profile?.role !== 'super_admin' && profile?.role !== 'isp_admin') {
        throw new Error('Only administrators can delete users');
      }

      console.log('Initiating user deletion for:', userId);

      // Call edge function to delete user completely
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        body: { userId }
      });

      if (error) {
        console.error('Delete user edge function error:', error);
        throw new Error(`Failed to delete user: ${error.message}`);
      }

      if (!data?.success) {
        console.error('User deletion failed:', data);
        throw new Error(data?.error || 'Failed to delete user account');
      }

      console.log('User deleted successfully:', data);
      return data;
    },
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-count'] });
      toast({
        title: "User Deleted Successfully",
        description: "User account and all associated data have been permanently deleted.",
      });
      console.log('Delete operation completed for user:', userId);
    },
    onError: (error, userId) => {
      console.error('Error deleting user:', userId, error);
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : 'Failed to delete user. Please try again.',
        variant: "destructive",
      });
    },
  });

  const deleteUser = (userId: string) => {
    console.log('Delete user requested for:', userId);
    deleteUserMutation.mutate(userId);
  };

  return {
    deleteUser,
    isDeletingUser: deleteUserMutation.isPending,
    canDeleteUser,
    superAdminCount,
    deleteUserMutation, // Expose the mutation for more advanced usage
  };
};
