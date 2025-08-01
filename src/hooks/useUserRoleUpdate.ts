
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/index';

export interface UpdateUserRoleParams {
  userId: string;
  newRole: UserRole;
}

export const useUserRoleUpdate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: UpdateUserRoleParams) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    },
  });

  return {
    updateUserRole: updateUserRole.mutate,
    isUpdatingRole: updateUserRole.isPending,
  };
};
