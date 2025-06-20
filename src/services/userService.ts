
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import type { CreateUserData, SystemUser, UpdateUserData } from '@/types/user';

type ProfileWithCompany = Database['public']['Tables']['profiles']['Row'] & {
  isp_companies: {
    name: string;
  } | null;
};

export const userService = {
  async fetchUsers(userRole: string | undefined, userCompanyId: string | null): Promise<SystemUser[]> {
    if (userRole !== 'super_admin' && userRole !== 'isp_admin') {
      return [];
    }

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
    if (userRole === 'isp_admin' && userCompanyId) {
      profileQuery = profileQuery.eq('isp_company_id', userCompanyId);
    }

    const { data: profilesData, error: profilesError } = await profileQuery;

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    if (!profilesData || profilesData.length === 0) {
      return [];
    }

    const typedProfilesData = profilesData as ProfileWithCompany[];

    return typedProfilesData.map((profileData) => ({
      id: profileData.id,
      email: 'Email not available',
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone,
      role: profileData.role as SystemUser['role'], // Type assertion to match SystemUser interface
      isp_company_id: profileData.isp_company_id,
      is_active: profileData.is_active ?? true,
      created_at: profileData.created_at ?? '',
      updated_at: profileData.updated_at ?? '',
      isp_companies: profileData.isp_companies ? { name: profileData.isp_companies.name } : undefined,
    }));
  },

  async createUser(userData: CreateUserData, userRole: string | undefined, userCompanyId: string | null) {
    if (userRole !== 'super_admin') {
      throw new Error('Insufficient permissions');
    }

    console.log('Creating complete user with auth and profile:', userData);
    
    try {
      // Call the edge function to create the user with admin privileges
      const { data, error } = await supabase.functions.invoke('create-user-account', {
        body: {
          email: userData.email,
          password: userData.password,
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone: userData.phone,
          role: userData.role,
          isp_company_id: userData.isp_company_id || userCompanyId,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!data?.success) {
        console.error('User creation failed:', data);
        throw new Error(data?.error || 'Failed to create user account');
      }

      console.log('User created successfully:', data.data);
      return data.data;
    } catch (error) {
      console.error('User creation process failed:', error);
      throw error;
    }
  },

  async updateUser(id: string, updates: UpdateUserData, userRole: string | undefined, userCompanyId: string | null) {
    if (userRole !== 'super_admin' && userRole !== 'isp_admin') {
      throw new Error('Insufficient permissions');
    }

    // Prevent non-super admins from changing company details
    if (userRole !== 'super_admin' && updates.isp_company_id) {
      throw new Error('Only super administrators can change company assignments');
    }

    // isp_admin can only update users in their company
    if (userRole === 'isp_admin' && userCompanyId) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('isp_company_id')
        .eq('id', id)
        .single();

      if (existingUser?.isp_company_id !== userCompanyId) {
        throw new Error('You can only update users in your company');
      }

      // Remove company_id from updates for isp_admin
      delete updates.isp_company_id;
    }

    // Create the update object with proper typing
    const updatePayload: any = { ...updates };

    const { data, error } = await supabase
      .from('profiles')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
