
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from './radiusService';
import { mikrotikApiService } from './mikrotikApiService';

export interface OnboardingStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  details?: any;
}

export interface OnboardingResult {
  success: boolean;
  steps: OnboardingStep[];
  clientId: string;
  message: string;
}

class ClientOnboardingService {
  async processClientOnboarding(clientId: string, equipmentId?: string): Promise<OnboardingResult> {
    const steps: OnboardingStep[] = [
      { name: 'Validate Client Data', status: 'pending' },
      { name: 'Assign Equipment', status: 'pending' },
      { name: 'Configure MikroTik Router', status: 'pending' },
      { name: 'Create RADIUS User', status: 'pending' },
      { name: 'Setup Network Profile', status: 'pending' },
      { name: 'Initialize Monitoring', status: 'pending' },
      { name: 'Activate Service', status: 'pending' },
      { name: 'Send Welcome Notification', status: 'pending' }
    ];

    let currentStepIndex = 0;

    try {
      // Step 1: Validate Client Data
      steps[currentStepIndex].status = 'in_progress';
      const client = await this.validateClientData(clientId);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = { clientName: client.name };
      currentStepIndex++;

      // Step 2: Assign Equipment
      steps[currentStepIndex].status = 'in_progress';
      const assignedEquipment = await this.assignEquipment(clientId, equipmentId);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = assignedEquipment;
      currentStepIndex++;

      // Step 3: Configure MikroTik Router
      steps[currentStepIndex].status = 'in_progress';
      const routerConfig = await this.configureMikroTikRouter(client, assignedEquipment);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = routerConfig;
      currentStepIndex++;

      // Step 4: Create RADIUS User
      steps[currentStepIndex].status = 'in_progress';
      const radiusUser = await this.createRadiusUser(client);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = radiusUser;
      currentStepIndex++;

      // Step 5: Setup Network Profile
      steps[currentStepIndex].status = 'in_progress';
      const networkProfile = await this.setupNetworkProfile(client, radiusUser);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = networkProfile;
      currentStepIndex++;

      // Step 6: Initialize Monitoring
      steps[currentStepIndex].status = 'in_progress';
      const monitoringSetup = await this.initializeMonitoring(clientId, assignedEquipment);
      steps[currentStepIndex].status = 'completed';
      steps[currentStepIndex].details = monitoringSetup;
      currentStepIndex++;

      // Step 7: Activate Service
      steps[currentStepIndex].status = 'in_progress';
      await this.activateClientService(clientId);
      steps[currentStepIndex].status = 'completed';
      currentStepIndex++;

      // Step 8: Send Welcome Notification
      steps[currentStepIndex].status = 'in_progress';
      await this.sendWelcomeNotification(client);
      steps[currentStepIndex].status = 'completed';

      return {
        success: true,
        steps,
        clientId,
        message: 'Client onboarding completed successfully'
      };

    } catch (error) {
      // Mark current step as failed
      if (currentStepIndex < steps.length) {
        steps[currentStepIndex].status = 'failed';
        steps[currentStepIndex].error = error instanceof Error ? error.message : 'Unknown error';
      }

      console.error('Client onboarding failed:', error);
      return {
        success: false,
        steps,
        clientId,
        message: `Onboarding failed at step: ${steps[currentStepIndex]?.name}`
      };
    }
  }

  private async validateClientData(clientId: string) {
    const { data: client, error } = await supabase
      .from('clients')
      .select(`
        *,
        service_packages (*)
      `)
      .eq('id', clientId)
      .single();

    if (error || !client) {
      throw new Error('Client not found or invalid data');
    }

    if (!client.service_packages) {
      throw new Error('Client has no assigned service package');
    }

    return client;
  }

  private async assignEquipment(clientId: string, equipmentId?: string) {
    let equipment;

    if (equipmentId) {
      // Use specific equipment
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', equipmentId)
        .eq('status', 'available')
        .single();

      if (error || !data) {
        throw new Error('Specified equipment not available');
      }
      equipment = data;
    } else {
      // Auto-assign available equipment
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'available')
        .eq('type', 'router')
        .limit(1)
        .single();

      if (error || !data) {
        throw new Error('No available equipment for assignment');
      }
      equipment = data;
    }

    // Create equipment assignment
    const { error: assignmentError } = await supabase
      .from('equipment_assignments')
      .insert({
        client_id: clientId,
        equipment_id: equipment.id,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        installation_notes: 'Automated assignment during onboarding',
        isp_company_id: equipment.isp_company_id
      });

    if (assignmentError) {
      throw new Error('Failed to create equipment assignment');
    }

    // Update equipment status
    await supabase
      .from('equipment')
      .update({ 
        status: 'assigned',
        client_id: clientId 
      })
      .eq('id', equipment.id);

    return equipment;
  }

  private async configureMikroTikRouter(client: any, equipment: any) {
    // Get available MikroTik routers
    const { data: routers, error } = await supabase
      .from('mikrotik_routers')
      .select('*')
      .eq('status', 'pending')
      .eq('connection_status', 'offline');

    if (error) {
      console.error('Error fetching MikroTik routers:', error);
      throw new Error('Failed to fetch MikroTik routers');
    }

    if (!routers || routers.length === 0) {
      // Create a mock router for demonstration
      const mockRouter = {
        id: 'mock-router-id',
        name: 'Mock MikroTik Router',
        ip_address: '192.168.1.1',
        admin_username: 'admin',
        admin_password: 'admin123'
      };

      const speedLimit = this.parseSpeedFromPackage(client.service_packages?.speed || '10Mbps');

      // Configure PPPoE secret on MikroTik
      const pppoeConfig = {
        name: client.email || client.phone,
        password: this.generateSecurePassword(),
        service: 'pppoe',
        profile: client.service_packages?.name?.toLowerCase().replace(/\s+/g, '_') || 'default',
        'rate-limit': `${speedLimit.upload}/${speedLimit.download}`,
        disabled: false,
        comment: `Client: ${client.name} - Auto configured`
      };

      // In production, this would use actual RouterOS API
      const configSuccess = await mikrotikApiService.createSimpleQueue(
        {
          ip: mockRouter.ip_address,
          username: mockRouter.admin_username,
          password: mockRouter.admin_password,
          port: 8728
        },
        {
          name: `client-${client.id}`,
          target: `${client.id}.dynamic`,
          maxDownload: speedLimit.download,
          maxUpload: speedLimit.upload,
          disabled: false
        }
      );

      if (!configSuccess) {
        throw new Error('Failed to configure MikroTik router');
      }

      return {
        routerId: mockRouter.id,
        routerName: mockRouter.name,
        pppoeConfig,
        speedLimit
      };
    }

    const router = routers[0];
    const speedLimit = this.parseSpeedFromPackage(client.service_packages?.speed || '10Mbps');

    // Configure PPPoE secret on MikroTik
    const pppoeConfig = {
      name: client.email || client.phone,
      password: this.generateSecurePassword(),
      service: 'pppoe',
      profile: client.service_packages?.name?.toLowerCase().replace(/\s+/g, '_') || 'default',
      'rate-limit': `${speedLimit.upload}/${speedLimit.download}`,
      disabled: false,
      comment: `Client: ${client.name} - Auto configured`
    };

    // In production, this would use actual RouterOS API
    const configSuccess = await mikrotikApiService.createSimpleQueue(
      {
        ip: router.ip_address,
        username: router.admin_username,
        password: router.admin_password,
        port: 8728
      },
      {
        name: `client-${client.id}`,
        target: `${client.id}.dynamic`,
        maxDownload: speedLimit.download,
        maxUpload: speedLimit.upload,
        disabled: false
      }
    );

    if (!configSuccess) {
      throw new Error('Failed to configure MikroTik router');
    }

    return {
      routerId: router.id,
      routerName: router.name,
      pppoeConfig,
      speedLimit
    };
  }

  private async createRadiusUser(client: any) {
    const radiusUser = {
      client_id: client.id,
      username: client.email || client.phone,
      password: this.generateSecurePassword(),
      group_name: client.service_packages?.name?.toLowerCase().replace(/\s+/g, '_') || 'default',
      max_upload: this.parseSpeedFromPackage(client.service_packages?.speed || '10Mbps').upload,
      max_download: this.parseSpeedFromPackage(client.service_packages?.speed || '10Mbps').download,
      expiration: client.subscription_end_date,
      is_active: true
    };

    const success = await radiusService.createUser(radiusUser as any);

    if (!success) {
      throw new Error('Failed to create RADIUS user');
    }

    return radiusUser;
  }

  private async setupNetworkProfile(client: any, radiusUser: any) {
    // Create network profile for monitoring and management
    const networkProfile = {
      client_id: client.id,
      username: radiusUser.username,
      ip_pool: 'dynamic',
      dns_servers: '8.8.8.8,8.8.4.4',
      firewall_rules: this.generateFirewallRules(client),
      qos_profile: radiusUser.group_name,
      isp_company_id: client.isp_company_id
    };

    // Store network configuration
    const { error } = await supabase
      .from('client_network_profiles')
      .upsert(networkProfile, { onConflict: 'client_id' });

    if (error) {
      console.warn('Failed to store network profile:', error);
    }

    return networkProfile;
  }

  private async initializeMonitoring(clientId: string, equipment: any) {
    // Initialize bandwidth monitoring
    const { error } = await supabase
      .from('bandwidth_statistics')
      .insert({
        client_id: clientId,
        equipment_id: equipment.id,
        in_octets: 0,
        out_octets: 0,
        in_packets: 0,
        out_packets: 0,
        isp_company_id: equipment.isp_company_id
      });

    if (error) {
      throw new Error('Failed to initialize monitoring');
    }

    return {
      monitoringEnabled: true,
      equipmentId: equipment.id
    };
  }

  private async activateClientService(clientId: string) {
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

    const { error } = await supabase
      .from('clients')
      .update({
        status: 'active',
        subscription_start_date: now.toISOString(),
        subscription_end_date: subscriptionEnd.toISOString(),
        service_activated_at: now.toISOString(),
        installation_status: 'completed',
        installation_completed_at: now.toISOString()
      })
      .eq('id', clientId);

    if (error) {
      throw new Error('Failed to activate client service');
    }
  }

  private async sendWelcomeNotification(client: any) {
    try {
      await supabase.functions.invoke('send-notifications', {
        body: {
          client_id: client.id,
          type: 'service_activation',
          data: {
            package_name: client.service_packages?.name,
            activation_date: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.warn('Failed to send welcome notification:', error);
    }
  }

  private parseSpeedFromPackage(speed: string) {
    const match = speed.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1]) : 10;
    
    return {
      download: `${speedValue}M`,
      upload: `${Math.floor(speedValue * 0.8)}M` // Upload is typically 80% of download
    };
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private generateFirewallRules(client: any) {
    return [
      'allow established,related',
      'allow icmp',
      'allow dns',
      'allow http,https',
      'drop invalid',
      'drop all'
    ];
  }
}

export const clientOnboardingService = new ClientOnboardingService();
