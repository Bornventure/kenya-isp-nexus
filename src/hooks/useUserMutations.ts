
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
      console.log('Creating user with data:', userData);
      return await userService.createUser(userData, profile?.role, profile?.isp_company_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Profile Created",
        description: "User profile has been created successfully. Note: This only creates the profile - authentication setup needs to be done separately.",
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user profile';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateUserData }) => {
      return await userService.updateUser(id, updates, profile?.role);
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
      toast({
        title: "Error",
        description: "Failed to update user. Please try again.",
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
