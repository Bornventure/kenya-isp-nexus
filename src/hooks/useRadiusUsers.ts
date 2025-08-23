
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RadiusUser } from '@/types/radius';

export const useRadiusUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  const getRadiusUsers = async (): Promise<RadiusUser[]> => {
    if (!profile?.isp_company_id) return [];

    // Use rpc to call our custom function that will handle the query
    const { data, error } = await supabase
      .rpc('get_radius_users_for_company', {
        company_id: profile.isp_company_id
      });

    if (error) {
      console.error('Error fetching RADIUS users:', error);
      throw error;
    }

    return (data || []).map((user: any) => ({
      ...user,
      groupName: user.profile,
      isActive: user.status === 'active',
      // Mock values for UI compatibility
      maxSimultaneousUse: 1,
      sessionTimeout: 3600,
      idleTimeout: 600,
      downloadSpeed: 5120,
      uploadSpeed: 512,
      monthlyQuota: 20000,
      totalSessions: 0,
      dataUsed: 0
    }));
  };

  const createRadiusUser = async (userData: Partial<RadiusUser>): Promise<RadiusUser> => {
    if (!profile?.isp_company_id) throw new Error('No company ID found');

    const { data, error } = await supabase
      .rpc('create_radius_user', {
        p_username: userData.username,
        p_password: userData.password,
        p_profile: userData.groupName || userData.profile || 'default',
        p_status: userData.status || 'active',
        p_client_id: userData.client_id,
        p_company_id: profile.isp_company_id
      });

    if (error) {
      console.error('Error creating RADIUS user:', error);
      throw error;
    }

    return {
      ...data,
      groupName: data.profile,
      isActive: data.status === 'active'
    };
  };

  const updateRadiusUser = async ({ id, updates }: { id: string; updates: Partial<RadiusUser> }): Promise<RadiusUser> => {
    const { data, error } = await supabase
      .rpc('update_radius_user', {
        p_user_id: id,
        p_username: updates.username,
        p_password: updates.password,
        p_profile: updates.groupName || updates.profile,
        p_status: updates.status,
        p_client_id: updates.client_id
      });

    if (error) {
      console.error('Error updating RADIUS user:', error);
      throw error;
    }

    return {
      ...data,
      groupName: data.profile,
      isActive: data.status === 'active'
    };
  };

  const deleteRadiusUser = async (id: string): Promise<void> => {
    const { error } = await supabase
      .rpc('delete_radius_user', {
        p_user_id: id
      });

    if (error) {
      console.error('Error deleting RADIUS user:', error);
      throw error;
    }
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['radius-users', profile?.isp_company_id],
    queryFn: getRadiusUsers,
    enabled: !!profile?.isp_company_id,
    refetchInterval: 30000
  });

  const { mutateAsync: createUser, isPending: isCreating } = useMutation({
    mutationFn: createRadiusUser,
    onSuccess: () => {
      toast({
        title: "User Created",
        description: "RADIUS user has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating user:', error);
    }
  });

  const { mutateAsync: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: updateRadiusUser,
    onSuccess: () => {
      toast({
        title: "User Updated",
        description: "RADIUS user has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error", 
        description: "Failed to update user. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating user:', error);
    }
  });

  const { mutateAsync: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: deleteRadiusUser,
    onSuccess: () => {
      toast({
        title: "User Deleted",
        description: "RADIUS user has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting user:', error);
    }
  });

  const disconnectUserSessions = async (username: string): Promise<void> => {
    const { error } = await supabase
      .rpc('disconnect_user_sessions', {
        p_username: username,
        p_company_id: profile?.isp_company_id
      });

    if (error) {
      console.error('Error disconnecting user sessions:', error);
      throw error;
    }
  };

  const { mutateAsync: disconnectUser, isPending: isDisconnecting } = useMutation({
    mutationFn: disconnectUserSessions,
    onSuccess: () => {
      toast({
        title: "User Disconnected",
        description: "All user sessions have been terminated.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['active-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to disconnect user sessions.",
        variant: "destructive",
      });
      console.error('Error disconnecting user:', error);
    }
  });

  return {
    users,
    isLoading,
    createUser,
    updateUser,
    deleteUser,
    disconnectUser,
    isCreating,
    isUpdating,
    isDeleting,
    isDisconnecting
  };
};

export default useRadiusUsers;
