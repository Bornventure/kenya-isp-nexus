
import { supabase } from '@/integrations/supabase/client';
import { SmsService } from '../smsService';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'super_admin' | 'technician' | 'client' | 'admin';
  accountType: 'client' | 'staff';
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
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  client_id?: string;
}

export class AuthService {
  private smsService: SmsService;

  constructor() {
    this.smsService = new SmsService();
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('Login attempt for phone:', credentials.phone);

      // First check if this is a client login (phone + ID number)
      if (credentials.id_number && !credentials.password) {
        return await this.loginClient(credentials.phone, credentials.id_number);
      }

      // Staff/admin login with password
      if (!credentials.password) {
        return { success: false, error: 'Password is required for staff login' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.phone,
        password: credentials.password,
      });

      if (error) {
        console.error('Auth error:', error);
        return { success: false, error: error.message };
      }

      const profile = await this.getUserProfile(data.user.id);
      if (!profile) {
        return { success: false, error: 'User profile not found' };
      }

      const user: User = {
        id: profile.id,
        email: profile.phone, // Using phone as email for compatibility
        firstName: profile.first_name || profile.phone,
        lastName: profile.last_name || '',
        phone: profile.phone,
        role: this.mapRole(profile.role),
        accountType: this.mapRole(profile.role) === 'client' ? 'client' : 'staff',
        isVerified: true,
        isp_company_id: profile.isp_company_id
      };

      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  private async loginClient(phone: string, idNumber: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Find client by phone and ID number
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', phone)
        .eq('id_number', idNumber)
        .single();

      if (clientError || !client) {
        return { success: false, error: 'Invalid phone number or ID number' };
      }

      // Check if client can login
      if (!['active', 'approved'].includes(client.status)) {
        return { success: false, error: `Account is ${client.status}. Please contact support.` };
      }

      // Check if client profile exists
      let profile = await this.getUserProfile(client.id);
      
      if (!profile) {
        // Create profile for client if it doesn't exist
        const { data: newProfile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: client.id,
            first_name: client.name.split(' ')[0],
            last_name: client.name.split(' ').slice(1).join(' '),
            phone: client.phone,
            role: 'technician', // Use valid role type
            isp_company_id: client.isp_company_id
          })
          .select()
          .single();

        if (profileError) {
          console.error('Error creating client profile:', profileError);
          return { success: false, error: 'Failed to create client profile' };
        }

        profile = newProfile;
      }

      const user: User = {
        id: client.id,
        email: client.email || client.phone,
        firstName: client.name.split(' ')[0],
        lastName: client.name.split(' ').slice(1).join(' '),
        phone: client.phone,
        role: 'client',
        accountType: 'client',
        isVerified: true,
        client_id: client.id,
        isp_company_id: client.isp_company_id
      };

      return { success: true, user };
    } catch (error) {
      console.error('Client login error:', error);
      return { success: false, error: 'Client login failed. Please try again.' };
    }
  }

  private async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      return null;
    }
  }

  async register(data: RegistrationData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.phone,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
          }
        }
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          role: (data.role || 'technician') as any,
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        return { success: false, error: 'Failed to create user profile' };
      }

      const user: User = {
        id: authData.user.id,
        email: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: this.mapRole(data.role || 'technician'),
        accountType: 'staff',
        isVerified: false,
        isp_company_id: profile.isp_company_id
      };

      // Send welcome SMS
      await this.sendWelcomeSMS(data.phone, data.firstName);

      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  private mapRole(role: string): 'super_admin' | 'technician' | 'client' | 'admin' {
    switch (role) {
      case 'super_admin':
        return 'super_admin';
      case 'isp_admin':
      case 'admin':
      case 'manager':
        return 'admin';
      case 'client':
        return 'client';
      default:
        return 'technician';
    }
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return null;

      const profile = await this.getUserProfile(user.id);
      if (!profile) return null;

      return {
        id: user.id,
        email: profile.phone || user.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        phone: profile.phone || '',
        role: this.mapRole(profile.role),
        accountType: this.mapRole(profile.role) === 'client' ? 'client' : 'staff',
        isVerified: true,
        isp_company_id: profile.isp_company_id
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async sendWelcomeSMS(phone: string, firstName: string): Promise<boolean> {
    try {
      const message = `Welcome ${firstName}! Your account has been created successfully. You can now access the ISP management system.`;
      return await this.smsService.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      return false;
    }
  }

  async sendClientWelcomeSMS(phone: string, data: { name: string; package: string }): Promise<boolean> {
    try {
      const message = `Welcome ${data.name}! Your ${data.package} internet service is being set up. You will receive connection details soon.`;
      return await this.smsService.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending client welcome SMS:', error);
      return false;
    }
  }

  async sendClientStatusSMS(phone: string, data: { name: string; status: string; reason?: string }): Promise<boolean> {
    try {
      let message = `Hello ${data.name}, your service status has been updated to: ${data.status.toUpperCase()}.`;
      if (data.reason) {
        message += ` Reason: ${data.reason}`;
      }
      message += ' For assistance, contact our support team.';
      
      return await this.smsService.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending status SMS:', error);
      return false;
    }
  }

  async sendVerificationSMS(phone: string, code: string): Promise<boolean> {
    try {
      const message = `Your verification code is: ${code}. Please enter this code to verify your account.`;
      return await this.smsService.sendSMS(phone, message);
    } catch (error) {
      console.error('Error sending verification SMS:', error);
      return false;
    }
  }
}

export { AuthService as default };
