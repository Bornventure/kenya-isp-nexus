
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

    const { data, error } = await supabase
      .from('radius_users')
      .select('*')
      .eq('isp_company_id', profile.isp_company_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching RADIUS users:', error);
      throw error;
    }

    return (data || []).map((user: any) => ({
      id: user.id,
      username: user.username,
      password: user.password,
      profile: user.group_name || 'default',
      status: user.is_active ? 'active' : 'inactive',
      client_id: user.client_id,
      isp_company_id: user.isp_company_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      groupName: user.group_name || 'default',
      isActive: user.is_active || false,
      maxSimultaneousUse: 1,
      sessionTimeout: parseInt(user.max_download) || 3600,
      idleTimeout: 600,
      downloadSpeed: parseInt(user.max_download) || 5120,
      uploadSpeed: parseInt(user.max_upload) || 512,
      monthlyQuota: 20000,
      totalSessions: 0,
      dataUsed: 0,
      expirationDate: user.expiration
    }));
  };

  const createRadiusUser = async (userData: Partial<RadiusUser>): Promise<RadiusUser> => {
    if (!profile?.isp_company_id) throw new Error('No company ID found');

    const { data, error } = await supabase
      .from('radius_users')
      .insert({
        username: userData.username,
        password: userData.password,
        group_name: userData.groupName || userData.profile || 'default',
        is_active: userData.isActive !== false,
        client_id: userData.client_id || '',
        isp_company_id: profile.isp_company_id,
        max_download: userData.downloadSpeed?.toString() || '5120',
        max_upload: userData.uploadSpeed?.toString() || '512',
        expiration: userData.expirationDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating RADIUS user:', error);
      throw error;
    }

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      profile: data.group_name,
      status: data.is_active ? 'active' : 'inactive',
      client_id: data.client_id,
      isp_company_id: data.isp_company_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      groupName: data.group_name,
      isActive: data.is_active,
      maxSimultaneousUse: 1,
      sessionTimeout: parseInt(data.max_download) || 3600,
      idleTimeout: 600,
      downloadSpeed: parseInt(data.max_download) || 5120,
      uploadSpeed: parseInt(data.max_upload) || 512,
      monthlyQuota: 20000,
      totalSessions: 0,
      dataUsed: 0,
      expirationDate: data.expiration
    };
  };

  const updateRadiusUser = async ({ id, updates }: { id: string; updates: Partial<RadiusUser> }): Promise<RadiusUser> => {
    const { data, error } = await supabase
      .from('radius_users')
      .update({
        username: updates.username,
        password: updates.password,
        group_name: updates.groupName || updates.profile,
        is_active: updates.isActive,
        client_id: updates.client_id,
        max_download: updates.downloadSpeed?.toString(),
        max_upload: updates.uploadSpeed?.toString(),
        expiration: updates.expirationDate
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating RADIUS user:', error);
      throw error;
    }

    return {
      id: data.id,
      username: data.username,
      password: data.password,
      profile: data.group_name,
      status: data.is_active ? 'active' : 'inactive',
      client_id: data.client_id,
      isp_company_id: data.isp_company_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
      groupName: data.group_name,
      isActive: data.is_active,
      maxSimultaneousUse: 1,
      sessionTimeout: parseInt(data.max_download) || 3600,
      idleTimeout: 600,
      downloadSpeed: parseInt(data.max_download) || 5120,
      uploadSpeed: parseInt(data.max_upload) || 512,
      monthlyQuota: 20000,
      totalSessions: 0,
      dataUsed: 0,
      expirationDate: data.expiration
    };
  };

  const deleteRadiusUser = async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('radius_users')
      .delete()
      .eq('id', id);

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
    // Delete active sessions for this user
    const { error } = await supabase
      .from('active_sessions')
      .delete()
      .eq('username', username)
      .eq('isp_company_id', profile?.isp_company_id);

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
