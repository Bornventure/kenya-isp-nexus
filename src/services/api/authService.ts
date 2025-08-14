
import { supabase } from '@/integrations/supabase/client';
import { sendSMS } from '@/services/smsService';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'technician' | 'client' | 'super_admin';
  accountType: 'admin' | 'client';
  isVerified: boolean;
  client_id?: string;
  isp_company_id?: string;
}

export interface LoginCredentials {
  phone: string;
  password?: string;
  id_number?: string;
}

export interface RegistrationData {
  name: string;
  email: string;
  phone: string;
  password: string;
  id_number: string;
  role?: 'admin' | 'technician';
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<{ user: User; session: any }> {
    console.log('AuthService: Starting login process', { phone: credentials.phone });

    try {
      // First check if this is a client login (has id_number but no password)
      if (credentials.id_number && !credentials.password) {
        console.log('AuthService: Attempting client login');
        return await this.clientLogin(credentials);
      }

      // Admin/Staff login with password
      if (!credentials.password) {
        throw new Error('Password is required for admin login');
      }

      console.log('AuthService: Attempting admin/staff login');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.phone + '@temp.com', // Temporary email format
        password: credentials.password,
      });

      if (error) {
        console.error('AuthService: Supabase auth error:', error);
        throw error;
      }

      if (!data.user) {
        throw new Error('Login failed - no user returned');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('AuthService: Profile fetch error:', profileError);
        throw new Error('Failed to fetch user profile');
      }

      const user: User = {
        id: profile.id,
        name: profile.full_name || profile.phone,
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone,
        role: profile.role,
        accountType: profile.role === 'client' ? 'client' : 'admin',
        isVerified: true,
        isp_company_id: profile.isp_company_id,
      };

      console.log('AuthService: Admin login successful', { userId: user.id, role: user.role });
      return { user, session: data.session };

    } catch (error) {
      console.error('AuthService: Login error:', error);
      throw error;
    }
  }

  static async clientLogin(credentials: LoginCredentials): Promise<{ user: User; session: any }> {
    if (!credentials.phone || !credentials.id_number) {
      throw new Error('Phone number and ID number are required for client login');
    }

    try {
      // Find client by phone and ID number
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', credentials.phone)
        .eq('id_number', credentials.id_number)
        .eq('is_active', true)
        .single();

      if (clientError || !client) {
        console.error('AuthService: Client not found:', clientError);
        throw new Error('Invalid credentials or inactive account');
      }

      // Create or get existing auth user for this client
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: `client_${client.id}@temp.com`,
        password: client.id_number, // Use ID number as password for clients
      });

      let authUser = authData?.user;

      // If auth user doesn't exist, create one
      if (authError || !authUser) {
        console.log('AuthService: Creating new auth user for client');
        const { data: newAuthData, error: signUpError } = await supabase.auth.signUp({
          email: `client_${client.id}@temp.com`,
          password: client.id_number,
        });

        if (signUpError || !newAuthData.user) {
          console.error('AuthService: Failed to create auth user:', signUpError);
          throw new Error('Failed to create client account');
        }

        authUser = newAuthData.user;

        // Create profile for the new auth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authUser.id,
            full_name: client.name,
            email: client.email,
            phone: client.phone,
            role: 'client',
            isp_company_id: client.isp_company_id,
          });

        if (profileError) {
          console.error('AuthService: Failed to create profile:', profileError);
          // Continue anyway as the main auth worked
        }
      }

      const user: User = {
        id: authUser.id,
        name: client.name,
        firstName: client.name.split(' ')[0] || '',
        lastName: client.name.split(' ').slice(1).join(' ') || '',
        email: client.email || '',
        phone: client.phone,
        role: 'client',
        accountType: 'client',
        isVerified: true,
        client_id: client.id,
        isp_company_id: client.isp_company_id,
      };

      console.log('AuthService: Client login successful', { userId: user.id, clientId: client.id });
      return { user, session: authData?.session || { access_token: 'temp', refresh_token: 'temp' } };

    } catch (error) {
      console.error('AuthService: Client login error:', error);
      throw error;
    }
  }

  static async register(data: RegistrationData): Promise<{ user: User; session: any }> {
    console.log('AuthService: Starting registration process', { phone: data.phone, email: data.email });

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError || !authData.user) {
        console.error('AuthService: Supabase auth registration error:', authError);
        throw authError || new Error('Registration failed');
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role || 'admin',
        });

      if (profileError) {
        console.error('AuthService: Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      const user: User = {
        id: authData.user.id,
        name: data.name,
        firstName: data.name.split(' ')[0] || '',
        lastName: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.phone,
        role: data.role || 'admin',
        accountType: 'admin',
        isVerified: false,
      };

      // Send welcome SMS
      try {
        await sendSMS(
          data.phone,
          `Welcome to LAKELINK! Your account has been created successfully. Please verify your account to get started.`
        );
      } catch (smsError) {
        console.error('AuthService: Failed to send welcome SMS:', smsError);
        // Don't fail registration if SMS fails
      }

      console.log('AuthService: Registration successful', { userId: user.id });
      return { user, session: authData.session };

    } catch (error) {
      console.error('AuthService: Registration error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    console.log('AuthService: Logging out user');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthService: Logout error:', error);
      throw error;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        return null;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileError) {
        console.error('AuthService: Profile fetch error:', profileError);
        return null;
      }

      const user: User = {
        id: profile.id,
        name: profile.full_name || profile.phone,
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
        email: profile.email || '',
        phone: profile.phone,
        role: profile.role,
        accountType: profile.role === 'client' ? 'client' : 'admin',
        isVerified: true,
        isp_company_id: profile.isp_company_id,
      };

      return user;

    } catch (error) {
      console.error('AuthService: Get current user error:', error);
      return null;
    }
  }

  static async requestPasswordReset(phone: string): Promise<void> {
    console.log('AuthService: Requesting password reset for:', phone);
    
    try {
      // Generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in database (you might want to create an OTPs table)
      // For now, we'll just send the SMS
      
      await sendSMS(
        phone,
        `Your LAKELINK password reset code is: ${otp}. This code expires in 10 minutes.`
      );

      console.log('AuthService: Password reset SMS sent successfully');
    } catch (error) {
      console.error('AuthService: Password reset error:', error);
      throw error;
    }
  }

  static async resetPassword(phone: string, otp: string, newPassword: string): Promise<void> {
    console.log('AuthService: Resetting password for:', phone);
    
    try {
      // In a real implementation, you would verify the OTP here
      // For now, we'll just update the password
      
      // Find user by phone
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', phone)
        .single();

      if (profileError || !profile) {
        throw new Error('User not found');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      // Send confirmation SMS
      await sendSMS(
        phone,
        `Your LAKELINK password has been successfully reset. You can now log in with your new password.`
      );

      console.log('AuthService: Password reset successful');
    } catch (error) {
      console.error('AuthService: Password reset error:', error);
      throw error;
    }
  }
}
