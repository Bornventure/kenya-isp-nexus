
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/userService';

export const useUsers = () => {
  const { profile } = useAuth();
  
  const canManageUsers = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['system-users', profile?.id],
    queryFn: async () => {
      if (!canManageUsers) return [];

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        return await userService.fetchUsers(profile?.role, profile?.isp_company_id);
      } catch (error) {
        console.error('Error in user management query:', error);
        throw error;
      }
    },
    enabled: canManageUsers,
  });

  return {
    users,
    isLoading,
    error,
    canManageUsers,
  };
};
