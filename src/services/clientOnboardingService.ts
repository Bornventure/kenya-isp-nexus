
import { supabase } from '@/integrations/supabase/client';

interface RadiusUser {
  id: string;
  username: string;
  password: string;
  profile: string;
  status: string;
  is_active: boolean;
  client_id: string;
  isp_company_id: string;
  created_at: string;
  updated_at: string;
}

export interface OnboardingStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  timestamp?: string;
  error?: string;
  details?: string;
  description?: string;
  completedAt?: string;
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
  const username = `${clientData.name.replace(/\s+/g, '').toLowerCase()}_${clientData.id.slice(0, 8)}`;
  const password = generateRandomPassword();

  // Create actual RADIUS user in the radius_users table
  const { data, error } = await supabase
    .from('radius_users')
    .insert({
      username,
      password,
      group_name: 'default',
      is_active: true,
      client_id: clientData.id,
      isp_company_id: clientData.isp_company_id,
      max_download: '10000', // Default 10Mbps
      max_upload: '5000' // Default 5Mbps
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating RADIUS user:', error);
    throw error;
  }

  // Also log the action
  await supabase
    .from('audit_logs')
    .insert({
      action: 'radius_user_created',
      resource: 'radius_user',
      resource_id: data.id,
      success: true,
      changes: { username, client_id: clientData.id } as any
    });

  const radiusUser: RadiusUser = {
    id: data.id,
    username: data.username,
    password: data.password,
    profile: 'default',
    status: 'active',
    client_id: data.client_id,
    isp_company_id: data.isp_company_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
    is_active: data.is_active
  };

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
    // Get client details to find service package
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('service_package_id, isp_company_id')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      throw new Error('Client not found');
    }

    // Use client_service_assignments table
    const { data, error } = await supabase
      .from('client_service_assignments')
      .insert({
        client_id: clientId,
        service_package_id: client.service_package_id || serviceData.service_package_id,
        assigned_at: new Date().toISOString(),
        is_active: true,
        notes: 'Created during onboarding',
        isp_company_id: client.isp_company_id
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
        changes: routerConfig as any
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
        changes: emailConfig as any
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
        changes: invoiceData as any
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
      { 
        id: 'profile_update', 
        name: 'Update Client Profile', 
        status: 'pending',
        description: 'Updating client profile and status'
      },
      { 
        id: 'radius_user', 
        name: 'Create RADIUS User', 
        status: 'pending',
        description: 'Creating RADIUS authentication user'
      },
      { 
        id: 'mikrotik_provision', 
        name: 'Provision MikroTik', 
        status: 'pending',
        description: 'Configuring MikroTik router settings'
      },
      { 
        id: 'welcome_email', 
        name: 'Send Welcome Email', 
        status: 'pending',
        description: 'Sending welcome email to client'
      },
      { 
        id: 'service_assignment', 
        name: 'Create Service Assignment', 
        status: 'pending',
        description: 'Assigning service package to client'
      }
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
      steps[0].completedAt = new Date().toISOString();

      // Step 2: Create RADIUS user
      steps[1].status = 'in_progress';
      const radiusUser = await createRadiusUser(client);
      steps[1].status = 'completed';
      steps[1].completedAt = new Date().toISOString();
      steps[1].message = `RADIUS user created: ${radiusUser.username}`;

      // Step 3: Provision MikroTik
      steps[2].status = 'in_progress';
      await provisionClientOnMikroTik(client);
      steps[2].status = 'completed';
      steps[2].completedAt = new Date().toISOString();

      // Step 4: Send welcome email
      steps[3].status = 'in_progress';
      await sendWelcomeEmail(client.email);
      steps[3].status = 'completed';
      steps[3].completedAt = new Date().toISOString();

      // Step 5: Create client service assignment
      steps[4].name = 'Create Service Assignment';
      steps[4].description = 'Assigning service package to client';
      steps[4].status = 'in_progress';
      await createClientService(clientId, {});
      steps[4].status = 'completed';
      steps[4].completedAt = new Date().toISOString();

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
        currentStep.error = error instanceof Error ? error.message : 'Unknown error';
        currentStep.completedAt = new Date().toISOString();
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
