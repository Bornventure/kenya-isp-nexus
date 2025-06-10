
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

// Customer login using email and ID number verification
export const customerLogin = async (loginData: CustomerLoginData) => {
  try {
    console.log('Attempting customer login with:', { email: loginData.email, idNumber: loginData.idNumber });
    
    // First, verify the client exists with the provided email and ID number
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, email, id_number, name')
      .eq('email', loginData.email)
      .eq('id_number', loginData.idNumber)
      .single();

    if (clientError || !client) {
      console.error('Client verification failed:', clientError);
      throw new Error('Invalid email or ID number. Please check your credentials.');
    }

    console.log('Client verified:', client);

    // Now attempt to sign in with Supabase auth using email
    // The password would be the ID number (as set during registration)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginData.email,
      password: loginData.idNumber
    });

    if (authError) {
      console.error('Authentication failed:', authError);
      throw new Error('Authentication failed. Please contact support if this continues.');
    }

    console.log('Customer login successful:', authData);
    return {
      success: true,
      user: authData.user,
      client: client
    };

  } catch (error: any) {
    console.error('Customer login error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

// Register a new client through the customer portal
export const registerClient = async (clientData: ClientRegistrationData) => {
  try {
    console.log('Registering client via customer portal:', clientData);

    const response = await fetch('/api/supabase/functions/v1/authenticated-client-registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabase.auth.getSession()?.access_token || ''}`,
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const result = await response.json();
    console.log('Client registration successful:', result);
    
    return result;
  } catch (error: any) {
    console.error('Client registration error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

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
