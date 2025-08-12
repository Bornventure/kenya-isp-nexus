
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RadiusUser {
  id: string;
  username: string;
  password?: string;
  groupName?: string;
  maxSimultaneousUse?: number;
  framedIpAddress?: string;
  sessionTimeout?: number;
  idleTimeout?: number;
  downloadSpeed?: number;
  uploadSpeed?: number;
  monthlyQuota?: number;
  dailyQuota?: number;
  expirationDate?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  totalSessions?: number;
  dataUsed?: number;
}

export const useRadiusUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Demo data for now since radius_users table doesn't exist
  const getRadiusUsers = async (): Promise<RadiusUser[]> => {
    return [
      {
        id: '1',
        username: 'user1@example.com',
        groupName: 'premium',
        maxSimultaneousUse: 1,
        framedIpAddress: '192.168.1.100',
        sessionTimeout: 3600,
        idleTimeout: 600,
        downloadSpeed: 10240,
        uploadSpeed: 1024,
        monthlyQuota: 50000,
        dailyQuota: 2000,
        isActive: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        totalSessions: 45,
        dataUsed: 25000
      },
      {
        id: '2',
        username: 'user2@example.com',
        groupName: 'standard',
        maxSimultaneousUse: 1,
        sessionTimeout: 3600,
        idleTimeout: 600,
        downloadSpeed: 5120,
        uploadSpeed: 512,
        monthlyQuota: 20000,
        dailyQuota: 1000,
        isActive: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastLogin: new Date(Date.now() - 3600000).toISOString(),
        totalSessions: 23,
        dataUsed: 12000
      }
    ];
  };

  const createRadiusUser = async (userData: Partial<RadiusUser>): Promise<RadiusUser> => {
    // This would integrate with RADIUS server to create user
    console.log('Creating RADIUS user:', userData);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      username: userData.username || '',
      groupName: userData.groupName || 'standard',
      maxSimultaneousUse: userData.maxSimultaneousUse || 1,
      sessionTimeout: userData.sessionTimeout || 3600,
      idleTimeout: userData.idleTimeout || 600,
      downloadSpeed: userData.downloadSpeed || 5120,
      uploadSpeed: userData.uploadSpeed || 512,
      monthlyQuota: userData.monthlyQuota || 20000,
      isActive: true,
      createdAt: new Date().toISOString(),
      totalSessions: 0,
      dataUsed: 0
    };
  };

  const updateRadiusUser = async ({ id, updates }: { id: string; updates: Partial<RadiusUser> }): Promise<RadiusUser> => {
    // This would integrate with RADIUS server to update user
    console.log('Updating RADIUS user:', id, updates);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    const existingUsers = await getRadiusUsers();
    const user = existingUsers.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    return { ...user, ...updates };
  };

  const deleteRadiusUser = async (id: string): Promise<void> => {
    // This would integrate with RADIUS server to delete user
    console.log('Deleting RADIUS user:', id);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['radius-users'],
    queryFn: getRadiusUsers,
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

  // For client disconnection, we'll call the existing RADIUS session termination
  const disconnectUserSessions = async (username: string): Promise<void> => {
    console.log('Disconnecting all sessions for user:', username);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  };

  const { mutateAsync: disconnectUser, isPending: isDisconnecting } = useMutation({
    mutationFn: disconnectUserSessions,
    onSuccess: () => {
      toast({
        title: "User Disconnected",
        description: "All user sessions have been terminated.",
      });
      queryClient.invalidateQueries({ queryKey: ['radius-sessions'] });
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
