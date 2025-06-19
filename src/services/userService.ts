
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
      role: profileData.role,
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

    // For now, we'll only create the profile without the auth user
    // This is because creating auth users requires admin privileges that we don't have in the client
    console.log('Creating user profile only. Email provided for reference:', userData.email);
    
    const newUserId = crypto.randomUUID();
    
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: newUserId,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone,
        role: userData.role,
        isp_company_id: userData.isp_company_id || userCompanyId,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw new Error(`Failed to create user profile: ${profileError.message}`);
    }

    return userProfile;
  },

  async updateUser(id: string, updates: UpdateUserData, userRole: string | undefined) {
    if (userRole !== 'super_admin' && userRole !== 'isp_admin') {
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
  }
};
