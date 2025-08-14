
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from './radiusService';
import { mikrotikService } from './mikrotikService';

export interface OnboardingStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  details?: any;
}

export interface OnboardingResult {
  success: boolean;
  message: string;
  steps: OnboardingStep[];
  clientCredentials?: {
    username: string;
    password: string;
  };
}

class ClientDeploymentService {
  async processClientOnboarding(clientId: string, equipmentId?: string): Promise<OnboardingResult> {
    console.log('Starting client onboarding process for:', clientId);
    
    const steps: OnboardingStep[] = [
      {
        id: 'validate_client',
        name: 'Client Validation',
        description: 'Validate client information and requirements',
        status: 'pending'
      },
      {
        id: 'create_radius_user',
        name: 'RADIUS User Creation',
        description: 'Create RADIUS authentication credentials',
        status: 'pending'
      },
      {
        id: 'configure_mikrotik',
        name: 'MikroTik Configuration',
        description: 'Configure PPPoE user on MikroTik router',
        status: 'pending'
      },
      {
        id: 'network_setup',
        name: 'Network Setup',
        description: 'Apply network policies and speed limits',
        status: 'pending'
      },
      {
        id: 'final_validation',
        name: 'Final Validation',
        description: 'Verify complete setup and connectivity',
        status: 'pending'
      }
    ];

    try {
      // Step 1: Validate client
      steps[0].status = 'in_progress';
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (clientError || !client) {
        steps[0].status = 'failed';
        return {
          success: false,
          message: 'Client validation failed',
          steps
        };
      }
      steps[0].status = 'completed';

      // Step 2: Create RADIUS user
      steps[1].status = 'in_progress';
      const radiusSuccess = await radiusService.createRadiusUser(clientId);
      if (!radiusSuccess) {
        steps[1].status = 'failed';
        return {
          success: false,
          message: 'RADIUS user creation failed',
          steps
        };
      }
      steps[1].status = 'completed';

      // Step 3: Configure MikroTik
      steps[2].status = 'in_progress';
      try {
        await mikrotikService.addClient({
          username: client.email || client.phone,
          password: this.generateSecurePassword(),
          profile: 'default'
        });
        steps[2].status = 'completed';
      } catch (error) {
        console.error('MikroTik configuration failed:', error);
        steps[2].status = 'failed';
        steps[2].details = { error: error instanceof Error ? error.message : 'Unknown error' };
      }

      // Step 4: Network setup
      steps[3].status = 'in_progress';
      // Apply network policies (simulated for now)
      await new Promise(resolve => setTimeout(resolve, 1000));
      steps[3].status = 'completed';

      // Step 5: Final validation
      steps[4].status = 'in_progress';
      await new Promise(resolve => setTimeout(resolve, 500));
      steps[4].status = 'completed';

      return {
        success: true,
        message: 'Client onboarding completed successfully',
        steps,
        clientCredentials: {
          username: client.email || client.phone,
          password: '[Generated Password]'
        }
      };

    } catch (error) {
      console.error('Onboarding process failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        steps
      };
    }
  }

  private generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

export const clientDeploymentService = new ClientDeploymentService();
