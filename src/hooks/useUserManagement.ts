
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

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

// Use the exact Supabase type for profiles with joined data
type ProfileWithCompany = Database['public']['Tables']['profiles']['Row'] & {
  isp_companies: {
    name: string;
  } | null;
};

// Type for auth users from Supabase admin API
interface AuthUser {
  id: string;
  email?: string;
  [key: string]: any;
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

      try {
        // Use the service role for admin operations to bypass RLS
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // First get profiles with company info using a direct query approach
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

        // Type the profiles data properly
        const typedProfilesData = profilesData as ProfileWithCompany[];

        // For now, we'll use a simplified approach for getting auth users
        // This will work for basic user management functionality
        const combinedUsers: SystemUser[] = typedProfilesData.map((profileData) => {
          return {
            id: profileData.id,
            email: 'Email not available', // We'll need to implement a separate way to get emails
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            phone: profileData.phone,
            role: profileData.role,
            isp_company_id: profileData.isp_company_id,
            is_active: profileData.is_active ?? true,
            created_at: profileData.created_at ?? '',
            updated_at: profileData.updated_at ?? '',
            isp_companies: profileData.isp_companies ? { name: profileData.isp_companies.name } : undefined,
          };
        });

        return combinedUsers;
      } catch (error) {
        console.error('Error in user management query:', error);
        throw error;
      }
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

      // Create auth user - this requires service role which may not be available in client
      // For now, we'll create a basic profile and handle auth separately
      const newUserId = crypto.randomUUID();
      
      // Create profile directly
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: newUserId,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: userData.role,
          isp_company_id: userData.isp_company_id || profile?.isp_company_id,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      return userProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-users'] });
      toast({
        title: "User Profile Created",
        description: "New user profile has been created. Auth setup needs to be completed separately.",
      });
    },
    onError: (error) => {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user profile. Please try again.",
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
