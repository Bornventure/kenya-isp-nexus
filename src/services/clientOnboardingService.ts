import { supabase } from '@/integrations/supabase/client';

interface RadiusUser {
  id: string;
  username: string;
  password?: string;
  is_active: boolean;
  client_id: string;
  created_at: string;
  updated_at: string;
}

const generateRandomPassword = (): string => {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const createRadiusUser = async (clientData: any): Promise<RadiusUser> => {
  const radiusUser: RadiusUser = {
    id: `${clientData.id}_radius`,
    username: clientData.username || clientData.email,
    password: clientData.password || generateRandomPassword(),
    is_active: true,
    client_id: clientData.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('radius_users')
    .insert(radiusUser)
    .select('*')
    .single();

  if (error) {
    console.error('Error creating RADIUS user:', error);
    throw error;
  }

  return data;
};

export const updateClientProfile = async (clientId: string, updates: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', clientId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client profile:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateClientProfile:', error);
    throw error;
  }
};

export const createClientService = async (clientId: string, serviceData: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('client_services')
      .insert({
        client_id: clientId,
        service_type: serviceData.service_type,
        start_date: serviceData.start_date,
        end_date: serviceData.end_date,
        status: serviceData.status || 'active',
        notes: serviceData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client service:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createClientService:', error);
    throw error;
  }
};

export const updateClientService = async (serviceId: string, updates: any): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('client_services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) {
      console.error('Error updating client service:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateClientService:', error);
    throw error;
  }
};

export const provisionClientOnMikroTik = async (clientData: any): Promise<boolean> => {
  try {
    console.log('Provisioning client on MikroTik...', clientData);
    
    // This is a placeholder for actual MikroTik API integration
    // In production, this would connect to MikroTik router via API
    
    const routerConfig = {
      clientId: clientData.id,
      username: clientData.username || clientData.email,
      ipAddress: clientData.assigned_ip || '192.168.1.100',
      bandwidth: clientData.bandwidth_profile || '10M/10M',
      isActive: true
    };

    console.log('MikroTik configuration:', routerConfig);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  } catch (error) {
    console.error('Error provisioning client on MikroTik:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (clientEmail: string): Promise<boolean> => {
  try {
    console.log(`Sending welcome email to ${clientEmail}...`);
    
    // Placeholder for actual email sending logic
    // In production, this would use an email service like SendGrid or Mailgun
    
    const emailConfig = {
      to: clientEmail,
      subject: 'Welcome to Our ISP!',
      body: 'Welcome to our Internet Service Provider! We are excited to have you as a new client.'
    };

    console.log('Email configuration:', emailConfig);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
};

export const createInitialInvoice = async (clientId: string): Promise<any> => {
  try {
    console.log(`Creating initial invoice for client ${clientId}...`);
    
    // Placeholder for actual invoice creation logic
    // In production, this would integrate with a billing system
    
    const invoiceData = {
      client_id: clientId,
      invoice_date: new Date().toISOString(),
      amount: 50.00,
      description: 'Initial setup fee',
      status: 'pending'
    };

    console.log('Invoice data:', invoiceData);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { success: true, message: 'Initial invoice created successfully.' };
  } catch (error) {
    console.error('Error creating initial invoice:', error);
    return { success: false, message: 'Failed to create initial invoice.' };
  }
};
