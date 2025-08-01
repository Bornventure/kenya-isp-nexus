
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { UserRole } from '@/types/user';

interface UpdateUserRoleParams {
  userId: string;
  role: UserRole;
}

export const useUserRoleUpdate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleParams) => {
      console.log('Updating user role:', { userId, role });
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          role: role as UserRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Role update error:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
      
      toast.success(`User role updated to ${data.role}`);
    },
    onError: (error: any) => {
      console.error('Failed to update user role:', error);
      toast.error(`Failed to update user role: ${error.message}`);
    },
  });
};
