
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { userService } from '@/services/userService';
import type { CreateUserData, UpdateUserData } from '@/types/user';

export const useUserMutations = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData) => {
      console.log('Creating complete user with data:', userData);
      return await userService.createUser(userData, profile?.role, profile?.isp_company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Created Successfully",
        description: "The user account and profile have been created. The user can now log in with their credentials.",
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateUserData }) => {
      return await userService.updateUser(id, updates, profile?.role, profile?.isp_company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Updated",
        description: "User information has been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user. Please try again.';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
  };
};
