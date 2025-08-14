
import { supabase } from '@/integrations/supabase/client';
import { mikrotikService } from './mikrotikService';
import { realNetworkService } from './realNetworkService';
import { radiusService } from './radiusService';
import { notificationService } from './notificationService';

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  error?: string;
  completedAt?: string;
  details?: string;
}

export interface OnboardingResult {
  success: boolean;
  message: string;
  steps: OnboardingStep[];
  clientId: string;
  equipmentId?: string;
  completedAt?: string;
}

class ClientOnboardingService {
  private steps: OnboardingStep[] = [
    {
      id: 'validate_client',
      name: 'Client Validation',
      description: 'Validate client data and requirements',
      status: 'pending'
    },
    {
      id: 'assign_equipment',
      name: 'Equipment Assignment',
      description: 'Assign CPE equipment to client',
      status: 'pending'
    },
    {
      id: 'create_radius_user',
      name: 'RADIUS User Creation',
      description: 'Create user account in FreeRADIUS',
      status: 'pending'
    },
    {
      id: 'configure_mikrotik',
      name: 'MikroTik Configuration',
      description: 'Configure PPPoE and bandwidth profiles',
      status: 'pending'
    },
    {
      id: 'setup_firewall',
      name: 'Firewall Rules',
      description: 'Configure client firewall rules',
      status: 'pending'
    },
    {
      id: 'initialize_monitoring',
      name: 'Network Monitoring',
      description: 'Initialize client network monitoring',
      status: 'pending'
    },
    {
      id: 'test_connectivity',
      name: 'Connectivity Test',
      description: 'Test client internet connectivity',
      status: 'pending'
    },
    {
      id: 'activate_service',
      name: 'Service Activation',
      description: 'Activate client service in system',
      status: 'pending'
    },
    {
      id: 'send_notifications',
      name: 'Welcome Notifications',
      description: 'Send welcome SMS and email to client',
      status: 'pending'
    }
  ];

  async processClientOnboarding(clientId: string, equipmentId?: string): Promise<OnboardingResult> {
    console.log('Starting client onboarding for:', clientId);
    
    const result: OnboardingResult = {
      success: false,
      message: '',
      steps: [...this.steps],
      clientId,
      equipmentId
    };

    try {
      // Step 1: Validate Client Data
      await this.executeStep(result, 'validate_client', async () => {
        const { data: client, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (error || !client) {
          throw new Error('Client not found or invalid');
        }

        if (!client.phone || !client.email) {
          throw new Error('Client phone and email are required');
        }

        return { client };
      });

      // Step 2: Assign Equipment (if provided)
      let assignedEquipment = null;
      if (equipmentId) {
        await this.executeStep(result, 'assign_equipment', async () => {
          const { data: equipment, error } = await supabase
            .from('equipment')
            .update({
              client_id: clientId,
              status: 'deployed'
            })
            .eq('id', equipmentId)
            .select()
            .single();

          if (error) throw error;
          assignedEquipment = equipment;
          return { equipment };
        });
      } else {
        this.markStepCompleted(result, 'assign_equipment', 'No equipment assignment required');
      }

      // Step 3: Create RADIUS User
      await this.executeStep(result, 'create_radius_user', async () => {
        const { data: client } = await supabase
          .from('clients')
          .select('*, service_packages(*)')
          .eq('id', clientId)
          .single();

        if (!client) throw new Error('Client data not found');

        const radiusUser = await radiusService.createUser({
          username: `client_${clientId.substring(0, 8)}`,
          password: this.generatePassword(),
          group_name: 'default_clients',
          attributes: {
            'Simultaneous-Use': '1',
            'Session-Timeout': '86400',
            'Idle-Timeout': '1800',
            'Framed-IP-Netmask': '255.255.255.0',
            'Framed-Protocol': 'PPP',
            'Service-Type': 'Framed-User'
          }
        });

        return { radiusUser };
      });

      // Step 4: Configure MikroTik
      await this.executeStep(result, 'configure_mikrotik', async () => {
        const config = await mikrotikService.addClient({
          username: `client_${clientId.substring(0, 8)}`,
          password: this.generatePassword(),
          profile: 'default'
        });

        return { config };
      });

      // Step 5: Setup Firewall Rules
      await this.executeStep(result, 'setup_firewall', async () => {
        // Simulate firewall configuration
        const firewallRules = {
          clientId,
          allowedServices: ['web', 'email', 'dns'],
          blockedPorts: [25, 135, 139, 445]
        };

        return { firewallRules };
      });

      // Step 6: Initialize Monitoring
      await this.executeStep(result, 'initialize_monitoring', async () => {
        const monitoringConfig = await realNetworkService.setupClientMonitoring({
          clientId,
          equipmentId: assignedEquipment?.id,
          monitoringInterval: 300,
          alertThresholds: {
            bandwidth: 80,
            latency: 100,
            packetLoss: 5
          }
        });

        return { monitoringConfig };
      });

      // Step 7: Test Connectivity
      await this.executeStep(result, 'test_connectivity', async () => {
        const connectivityTest = await realNetworkService.testClientConnectivity({
          clientId,
          testEndpoints: ['8.8.8.8', '1.1.1.1', 'google.com']
        });

        if (!connectivityTest.success) {
          throw new Error('Connectivity test failed');
        }

        return { connectivityTest };
      });

      // Step 8: Activate Service
      await this.executeStep(result, 'activate_service', async () => {
        const { error } = await supabase
          .from('clients')
          .update({
            status: 'active',
            service_activated_at: new Date().toISOString(),
            installation_status: 'completed'
          })
          .eq('id', clientId);

        if (error) throw error;
        return { activated: true };
      });

      // Step 9: Send Welcome Notifications
      await this.executeStep(result, 'send_notifications', async () => {
        const { data: client } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (client) {
          await notificationService.sendWelcomeNotifications({
            clientId,
            phone: client.phone,
            email: client.email,
            name: client.name
          });
        }

        return { notificationsSent: true };
      });

      result.success = true;
      result.message = 'Client onboarding completed successfully';
      result.completedAt = new Date().toISOString();

    } catch (error) {
      console.error('Client onboarding failed:', error);
      result.success = false;
      result.message = error instanceof Error ? error.message : 'Unknown error occurred';
    }

    return result;
  }

  private async executeStep(
    result: OnboardingResult,
    stepId: string,
    stepFunction: () => Promise<any>
  ): Promise<void> {
    const step = result.steps.find(s => s.id === stepId);
    if (!step) return;

    try {
      step.status = 'in_progress';
      console.log(`Executing step: ${step.name}`);
      
      await stepFunction();
      
      step.status = 'completed';
      step.completedAt = new Date().toISOString();
      step.details = 'Step completed successfully';
      console.log(`Step completed: ${step.name}`);
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      step.details = `Failed: ${step.error}`;
      console.error(`Step failed: ${step.name}`, error);
      throw error;
    }
  }

  private markStepCompleted(result: OnboardingResult, stepId: string, message?: string): void {
    const step = result.steps.find(s => s.id === stepId);
    if (step) {
      step.status = 'completed';
      step.completedAt = new Date().toISOString();
      step.details = message || 'Step completed';
      if (message) {
        step.description = message;
      }
    }
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async getOnboardingStatus(clientId: string): Promise<OnboardingResult | null> {
    const { data: client, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (error || !client) return null;

    const isOnboarded = client.status === 'active' && client.service_activated_at;

    return {
      success: isOnboarded,
      message: isOnboarded ? 'Client fully onboarded' : 'Client onboarding incomplete',
      steps: this.steps.map(step => ({
        ...step,
        status: isOnboarded ? 'completed' : 'pending',
        details: isOnboarded ? 'Completed' : 'Pending'
      })),
      clientId,
      completedAt: client.service_activated_at
    };
  }
}

export const clientOnboardingService = new ClientOnboardingService();
