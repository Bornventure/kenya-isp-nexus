import { supabase } from '@/integrations/supabase/client';

export interface CustomerLoginData {
  email: string;
  idNumber?: string;
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

// Customer login using the improved client-auth function
export const customerLogin = async (loginData: CustomerLoginData) => {
  try {
    console.log('Attempting customer login with:', { email: loginData.email, hasIdNumber: !!loginData.idNumber });
    
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
      throw new Error(data?.error || 'Invalid credentials. Please check your email and ID number.');
    }

    console.log('Customer login successful:', data);
    return {
      success: true,
      client: data.client,
      access_message: data.access_message
    };

  } catch (error: any) {
    console.error('Customer login error:', error);
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};

// Enhanced package renewal with paybill payment instructions
export const renewPackage = async (renewalData: {
  client_email: string;
  client_id_number?: string;
  mpesa_number?: string;
  package_id?: string;
}) => {
  try {
    console.log('Initiating package renewal:', renewalData);

    const { data, error } = await supabase.functions.invoke('package-renewal', {
      body: renewalData
    });

    if (error) {
      console.error('Package renewal error:', error);
      throw new Error(error.message || 'Failed to initiate renewal');
    }

    if (!data?.success) {
      console.error('Package renewal failed:', data?.error);
      throw new Error(data?.error || 'Failed to initiate renewal');
    }

    console.log('Package renewal initiated successfully');
    return data;

  } catch (error: any) {
    console.error('Package renewal error:', error);
    throw new Error(error.message || 'Failed to initiate package renewal');
  }
};

// Check payment status with enhanced error handling
export const checkPaymentStatus = async (paymentData: {
  paymentId: string;
  checkoutRequestId: string;
}) => {
  try {
    console.log('Checking payment status:', paymentData);

    const { data, error } = await supabase.functions.invoke('check-payment-status', {
      body: paymentData
    });

    if (error) {
      console.error('Payment status check error:', error);
      throw new Error(error.message || 'Failed to check payment status');
    }

    console.log('Payment status checked:', data);
    return data;

  } catch (error: any) {
    console.error('Payment status check error:', error);
    throw new Error(error.message || 'Failed to check payment status');
  }
};

// Generate receipt for payments or invoices
export const generateReceipt = async (receiptData: {
  client_email: string;
  client_id_number?: string;
  payment_id?: string;
  invoice_id?: string;
}) => {
  try {
    console.log('Generating receipt:', receiptData);

    const { data, error } = await supabase.functions.invoke('generate-receipt', {
      body: receiptData
    });

    if (error) {
      console.error('Receipt generation error:', error);
      throw new Error(error.message || 'Failed to generate receipt');
    }

    if (!data?.success) {
      console.error('Receipt generation failed:', data?.error);
      throw new Error(data?.error || 'Failed to generate receipt');
    }

    console.log('Receipt generated successfully');
    return data;

  } catch (error: any) {
    console.error('Receipt generation error:', error);
    throw new Error(error.message || 'Failed to generate receipt');
  }
};

// Register a new client through the customer portal
export const registerClientAuthenticated = async (clientData: ClientRegistrationData, accessToken: string) => {
  try {
    console.log('Registering client via customer portal:', clientData);

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

// Submit a support ticket
export const submitSupportTicket = async (ticketData: {
  client_email: string;
  client_id_number: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}) => {
  try {
    console.log('Submitting support ticket:', ticketData.title);

    const { data, error } = await supabase.functions.invoke('submit-support-ticket', {
      body: ticketData
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to submit support ticket');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to submit support ticket');
    }

    console.log('Support ticket submitted successfully:', data.ticket.id);
    return data;

  } catch (error: any) {
    console.error('Submit support ticket error:', error);
    throw new Error(error.message || 'Failed to submit support ticket');
  }
};

// Update client profile
export const updateClientProfile = async (profileData: {
  client_email: string;
  client_id_number: string;
  updates: {
    phone?: string;
    mpesa_number?: string;
    address?: string;
    county?: string;
    sub_county?: string;
  };
}) => {
  try {
    console.log('Updating client profile for:', profileData.client_email);

    const { data, error } = await supabase.functions.invoke('update-client-profile', {
      body: profileData
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to update profile');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to update profile');
    }

    console.log('Client profile updated successfully');
    return data;

  } catch (error: any) {
    console.error('Update client profile error:', error);
    throw new Error(error.message || 'Failed to update profile');
  }
};

// Get payment history with pagination
export const getPaymentHistory = async (params: {
  client_email: string;
  client_id_number: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = new URLSearchParams({
      client_email: params.client_email,
      client_id_number: params.client_id_number,
      page: (params.page || 1).toString(),
      limit: (params.limit || 10).toString()
    });

    console.log('Fetching payment history for:', params.client_email);

    const { data, error } = await supabase.functions.invoke('get-payment-history?' + queryParams.toString());

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to fetch payment history');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to fetch payment history');
    }

    console.log('Payment history fetched:', data.payments.length, 'payments');
    return data;

  } catch (error: any) {
    console.error('Get payment history error:', error);
    throw new Error(error.message || 'Failed to fetch payment history');
  }
};

// Get invoice details (single invoice or list with pagination)
export const getInvoiceDetails = async (params: {
  client_email: string;
  client_id_number: string;
  invoice_id?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const queryParams = new URLSearchParams({
      client_email: params.client_email,
      client_id_number: params.client_id_number,
      ...(params.invoice_id && { invoice_id: params.invoice_id }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.limit && { limit: params.limit.toString() })
    });

    console.log('Fetching invoice details for:', params.client_email);

    const { data, error } = await supabase.functions.invoke('get-invoice-details?' + queryParams.toString());

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || 'Failed to fetch invoice details');
    }

    if (!data?.success) {
      throw new Error(data?.error || 'Failed to fetch invoice details');
    }

    console.log('Invoice details fetched successfully');
    return data;

  } catch (error: any) {
    console.error('Get invoice details error:', error);
    throw new Error(error.message || 'Failed to fetch invoice details');
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

// Add new function for getting paybill payment instructions
export const getPaybillInstructions = async (clientData: {
  client_email: string;
  client_id_number?: string;
}) => {
  try {
    console.log('Getting paybill instructions for:', clientData.client_email);

    // Get client authentication to retrieve payment settings
    const authData = await customerLogin({
      email: clientData.client_email,
      idNumber: clientData.client_id_number
    });
    
    if (!authData.success) {
      throw new Error('Failed to authenticate client');
    }

    const paymentSettings = authData.client.payment_settings;
    
    return {
      success: true,
      instructions: {
        paybill_number: paymentSettings.paybill_number,
        account_number: authData.client.id_number, // Use ID number as account reference
        steps: [
          'Go to M-Pesa menu on your phone',
          'Select "Lipa na M-Pesa"',
          'Select "Pay Bill"',
          `Enter Business Number: ${paymentSettings.paybill_number}`,
          `Enter Account Number: ${authData.client.id_number}`,
          'Enter the amount you want to pay',
          'Enter your M-Pesa PIN',
          'Confirm the payment',
          'Your wallet will be credited automatically within minutes'
        ]
      }
    };

  } catch (error: any) {
    console.error('Get paybill instructions error:', error);
    throw new Error(error.message || 'Failed to get payment instructions');
  }
};
