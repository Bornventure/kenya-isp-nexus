
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface SystemUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'super_admin' | 'isp_admin' | 'manager' | 'technician' | 'support' | 'billing' | 'readonly';
  isp_company_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  isp_companies?: {
    name: string;
  };
}

// Define the profile data type as returned from Supabase
interface ProfileData {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'super_admin' | 'isp_admin' | 'manager' | 'technician' | 'support' | 'billing' | 'readonly';
  isp_company_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  isp_companies?: {
    name: string;
  } | null;
}

export const useUserManagement = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Only super_admin and isp_admin can manage users
  const canManageUsers = profile?.role === 'super_admin' || profile?.role === 'isp_admin';

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['system-users', profile?.id],
    queryFn: async () => {
      if (!canManageUsers) return [];

      // First get profiles with company info
      let profileQuery = supabase
        .from('profiles')
        .select(`
          *,
          isp_companies (
            name
          )
        `)
        .order('created_at', { ascending: false });

      // isp_admin can only see users in their company
      if (profile?.role === 'isp_admin' && profile?.isp_company_id) {
        profileQuery = profileQuery.eq('isp_company_id', profile.isp_company_id);
      }

      const { data: profilesData, error: profilesError } = await profileQuery;

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      if (!profilesData || profilesData.length === 0) {
        return [];
      }

      // Get auth users to get email addresses
      const userIds = profilesData.map((p: ProfileData) => p.id);
      
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

      if (authError) {
        console.error('Error fetching auth users:', authError);
        throw authError;
      }

      // Combine profile data with auth user data
      const combinedUsers: SystemUser[] = profilesData.map((profileData: ProfileData) => {
        const authUser = authUsers.users.find(u => u.id === profileData.id);
        return {
          ...profileData,
          email: authUser?.email || '',
          isp_companies: profileData.isp_companies || undefined,
        };
      });

      return combinedUsers;
    },
    enabled: canManageUsers,
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      phone?: string;
      role: SystemUser['role'];
      isp_company_id?: string;
    }) => {
      // Only super_admin can create users
      if (profile?.role !== 'super_admin') {
        throw new Error('Insufficient permissions');
      }

      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        }
      });

      if (authError) throw authError;

      // Update profile with role and company
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: userData.role,
          isp_company_id: userData.isp_company_id,
        })
        .eq('id', authUser.user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      return userProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Created",
        description: "New user account has been successfully created.",
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<SystemUser> }) => {
      if (!canManageUsers) {
        throw new Error('Insufficient permissions');
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    users,
    isLoading,
    error,
    canManageUsers,
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserMutation.isPending,
  };
};
