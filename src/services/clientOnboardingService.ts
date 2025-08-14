
import { supabase } from '@/integrations/supabase/client';

interface RadiusUser {
  id: string;
  username: string;
  password: string;
  is_active: boolean;
  client_id: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
}

export interface OnboardingResult {
  success: boolean;
  message: string;
  steps: OnboardingStep[];
  clientId: string;
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

  // Use audit_logs table to simulate RADIUS user creation
  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      action: 'radius_user_created',
      resource: 'radius_user',
      resource_id: radiusUser.id,
      success: true,
      changes: radiusUser
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating RADIUS user:', error);
    throw error;
  }

  return radiusUser;
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
    // Use client_service_assignments table instead of client_services
    const { data, error } = await supabase
      .from('client_service_assignments')
      .insert({
        client_id: clientId,
        service_package_id: serviceData.service_package_id,
        assigned_at: serviceData.start_date,
        is_active: serviceData.status === 'active',
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
      .from('client_service_assignments')
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
    
    const routerConfig = {
      clientId: clientData.id,
      username: clientData.username || clientData.email,
      ipAddress: clientData.assigned_ip || '192.168.1.100',
      bandwidth: clientData.bandwidth_profile || '10M/10M',
      isActive: true
    };

    console.log('MikroTik configuration:', routerConfig);
    
    // Log the provisioning action
    await supabase
      .from('audit_logs')
      .insert({
        action: 'mikrotik_provision',
        resource: 'client',
        resource_id: clientData.id,
        success: true,
        changes: routerConfig
      });
    
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
    
    const emailConfig = {
      to: clientEmail,
      subject: 'Welcome to Our ISP!',
      body: 'Welcome to our Internet Service Provider! We are excited to have you as a new client.'
    };

    console.log('Email configuration:', emailConfig);
    
    // Log the email action
    await supabase
      .from('audit_logs')
      .insert({
        action: 'welcome_email_sent',
        resource: 'email',
        resource_id: clientEmail,
        success: true,
        changes: emailConfig
      });
    
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
    
    const invoiceData = {
      client_id: clientId,
      invoice_date: new Date().toISOString(),
      amount: 50.00,
      description: 'Initial setup fee',
      status: 'pending'
    };

    console.log('Invoice data:', invoiceData);
    
    // Log the invoice creation
    await supabase
      .from('audit_logs')
      .insert({
        action: 'initial_invoice_created',
        resource: 'invoice',
        resource_id: clientId,
        success: true,
        changes: invoiceData
      });
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return { success: true, message: 'Initial invoice created successfully.' };
  } catch (error) {
    console.error('Error creating initial invoice:', error);
    return { success: false, message: 'Failed to create initial invoice.' };
  }
};

class ClientOnboardingService {
  async processClientOnboarding(clientId: string, equipmentId?: string): Promise<OnboardingResult> {
    const steps: OnboardingStep[] = [
      { id: 'profile_update', name: 'Update Client Profile', status: 'pending' },
      { id: 'radius_user', name: 'Create RADIUS User', status: 'pending' },
      { id: 'mikrotik_provision', name: 'Provision MikroTik', status: 'pending' },
      { id: 'welcome_email', name: 'Send Welcome Email', status: 'pending' },
      { id: 'initial_invoice', name: 'Create Initial Invoice', status: 'pending' }
    ];

    try {
      // Get client data
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // Step 1: Update client profile
      steps[0].status = 'in_progress';
      await updateClientProfile(clientId, { status: 'active' });
      steps[0].status = 'completed';
      steps[0].timestamp = new Date().toISOString();

      // Step 2: Create RADIUS user
      steps[1].status = 'in_progress';
      await createRadiusUser(client);
      steps[1].status = 'completed';
      steps[1].timestamp = new Date().toISOString();

      // Step 3: Provision MikroTik
      steps[2].status = 'in_progress';
      await provisionClientOnMikroTik(client);
      steps[2].status = 'completed';
      steps[2].timestamp = new Date().toISOString();

      // Step 4: Send welcome email
      steps[3].status = 'in_progress';
      await sendWelcomeEmail(client.email);
      steps[3].status = 'completed';
      steps[3].timestamp = new Date().toISOString();

      // Step 5: Create initial invoice
      steps[4].status = 'in_progress';
      await createInitialInvoice(clientId);
      steps[4].status = 'completed';
      steps[4].timestamp = new Date().toISOString();

      return {
        success: true,
        message: 'Client onboarding completed successfully',
        steps,
        clientId
      };

    } catch (error) {
      console.error('Onboarding error:', error);
      
      // Mark current step as failed
      const currentStep = steps.find(s => s.status === 'in_progress');
      if (currentStep) {
        currentStep.status = 'failed';
        currentStep.message = error instanceof Error ? error.message : 'Unknown error';
        currentStep.timestamp = new Date().toISOString();
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Onboarding failed',
        steps,
        clientId
      };
    }
  }
}

export const clientOnboardingService = new ClientOnboardingService();
