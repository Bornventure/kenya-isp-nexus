import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import type { CreateUserData, SystemUser, UpdateUserData } from '@/types/user';
import { credentialDeliveryService } from './credentialDeliveryService';

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

    console.log('Creating complete user with auth and profile:', userData);
    
    try {
      // Step 1: Create the auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name,
        },
        email_confirm: true,
      });

      if (authError) {
        console.error('Auth user creation error:', authError);
        throw new Error(`Failed to create auth user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('No user returned from auth creation');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Step 2: Create/update the profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      let profileData;

      if (!existingProfile) {
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
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
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error(`Failed to create user profile: ${profileError.message}`);
        }

        profileData = newProfile;
      } else {
        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone: userData.phone,
            role: userData.role,
            isp_company_id: userData.isp_company_id || userCompanyId,
          })
          .eq('id', authData.user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Profile update error:', updateError);
          throw new Error(`Failed to update user profile: ${updateError.message}`);
        }

        profileData = updatedProfile;
      }

      // Step 3: Send credentials to user via email and SMS
      try {
        await credentialDeliveryService.sendCredentials({
          email: userData.email,
          phone: userData.phone,
          first_name: userData.first_name,
          last_name: userData.last_name,
          password: userData.password,
          role: userData.role,
        });
        console.log('Credentials sent successfully to user');
      } catch (credentialError) {
        console.warn('Failed to send credentials, but user was created successfully:', credentialError);
        // Don't fail the entire operation if credential delivery fails
      }

      return profileData;
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
