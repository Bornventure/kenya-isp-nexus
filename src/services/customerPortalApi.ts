
import { supabase } from '@/integrations/supabase/client';

export interface CustomerLoginData {
  email: string;
  idNumber: string;
}

export interface ClientRegistrationData {
  name: string;
  email: string;
  phone: string;
  mpesa_number?: string;
  id_number: string;
  kra_pin_number?: string;
  client_type: 'individual' | 'business' | 'corporate' | 'government';
  connection_type: 'fiber' | 'wireless' | 'satellite' | 'dsl';
  address: string;
  county: string;
  sub_county: string;
  service_package_id?: string;
  isp_company_id: string;
}

// Customer login using the correct Supabase edge function
export const customerLogin = async (loginData: CustomerLoginData) => {
  try {
    console.log('Attempting customer login with:', { email: loginData.email, idNumber: loginData.idNumber });
    
    // Use the Supabase client to call the edge function directly
    const { data, error } = await supabase.functions.invoke('client-auth', {
      body: {
        email: loginData.email,
        id_number: loginData.idNumber
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Authentication failed');
    }

    if (!data?.success) {
      console.error('Authentication failed:', data?.error);
      throw new Error(data?.error || 'Invalid email or ID number. Please check your credentials.');
    }

    console.log('Customer login successful:', data);
    return {
      success: true,
      client: data.client
    };

  } catch (error: any) {
    console.error('Customer login error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

// Register a new client through the customer portal
export const registerClientAuthenticated = async (clientData: ClientRegistrationData, accessToken: string) => {
  try {
    console.log('Registering client via customer portal:', clientData);

    // Use the Supabase client to call the edge function
    const { data, error } = await supabase.functions.invoke('client-registration', {
      body: clientData
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Registration failed');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Registration failed');
    }

    console.log('Client registration successful:', data);
    return data;
    
  } catch (error: any) {
    console.error('Client registration error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

// Alias for backward compatibility
export const registerClient = registerClientAuthenticated;

// Get client profile data
export const getClientProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw new Error('Failed to fetch profile');
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select(`
        *,
        service_packages (
          id,
          name,
          speed,
          monthly_rate
        )
      `)
      .eq('email', user.email)
      .single();

    if (clientError) {
      console.error('Client data fetch error:', clientError);
      throw new Error('Failed to fetch client data');
    }

    return {
      user,
      profile,
      client
    };
  } catch (error: any) {
    console.error('Get client profile error:', error);
    throw new Error(error.message || 'Failed to fetch profile');
  }
};

// Customer logout
export const customerLogout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
    return { success: true };
  } catch (error: any) {
    console.error('Customer logout error:', error);
    throw new Error(error.message || 'Logout failed');
  }
};
