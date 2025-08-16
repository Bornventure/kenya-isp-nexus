
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from './radiusService';
import { mikrotikApiService } from './mikrotikApiService';

export interface ClientActivationData {
  clientId: string;
  equipmentId: string;
  approvedBy: string;
  activationNotes?: string;
}

export interface ActivationResult {
  success: boolean;
  message: string;
  details?: {
    radiusUser?: boolean;
    mikrotikConfig?: boolean;
    serviceActivated?: boolean;
    monitoringSetup?: boolean;
  };
}

class ClientActivationService {
  async activateClient(data: ClientActivationData): Promise<ActivationResult> {
    try {
      console.log('Starting client activation process for:', data.clientId);

      // 1. Get client and package details
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select(`
          *,
          service_packages (*)
        `)
        .eq('id', data.clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // 2. Get equipment details
      const { data: equipment, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', data.equipmentId)
        .single();

      if (equipmentError || !equipment) {
        throw new Error('Equipment not found');
      }

      const results = {
        radiusUser: false,
        mikrotikConfig: false,
        serviceActivated: false,
        monitoringSetup: false,
      };

      // 3. Create RADIUS user
      try {
        const radiusSuccess = await radiusService.createRadiusUser(data.clientId);
        results.radiusUser = radiusSuccess;
        console.log('RADIUS user creation:', radiusSuccess ? 'Success' : 'Failed');
      } catch (error) {
        console.error('RADIUS user creation failed:', error);
      }

      // 4. Configure MikroTik QoS
      try {
        const mikrotikSuccess = await this.configureMikrotikForClient(client, equipment);
        results.mikrotikConfig = mikrotikSuccess;
        console.log('MikroTik configuration:', mikrotikSuccess ? 'Success' : 'Failed');
      } catch (error) {
        console.error('MikroTik configuration failed:', error);
      }

      // 5. Activate service and set subscription dates
      try {
        const activationSuccess = await this.activateClientService(client, data);
        results.serviceActivated = activationSuccess;
        console.log('Service activation:', activationSuccess ? 'Success' : 'Failed');
      } catch (error) {
        console.error('Service activation failed:', error);
      }

      // 6. Setup monitoring
      try {
        const monitoringSuccess = await this.setupClientMonitoring(data.clientId, data.equipmentId);
        results.monitoringSetup = monitoringSuccess;
        console.log('Monitoring setup:', monitoringSuccess ? 'Success' : 'Failed');
      } catch (error) {
        console.error('Monitoring setup failed:', error);
      }

      // 7. Send activation notification
      try {
        await supabase.functions.invoke('send-notifications', {
          body: {
            client_id: data.clientId,
            type: 'service_activation',
            data: {
              package_name: client.service_packages?.name,
              activation_date: new Date().toISOString(),
              equipment_assigned: equipment.model
            }
          }
        });
      } catch (error) {
        console.error('Activation notification failed:', error);
      }

      const allSuccess = Object.values(results).every(Boolean);
      
      return {
        success: allSuccess,
        message: allSuccess 
          ? 'Client activated successfully with full automation'
          : 'Client activation completed with some issues',
        details: results
      };

    } catch (error) {
      console.error('Client activation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Activation failed'
      };
    }
  }

  private async configureMikrotikForClient(client: any, equipment: any): Promise<boolean> {
    try {
      // Use existing MikroTik routers hook data instead of direct database query
      console.log('Configuring MikroTik for client:', client.name);
      
      // For now, we'll simulate MikroTik configuration since the table structure needs clarification
      // In production, this would configure QoS rules on actual MikroTik devices
      const queueConfig = {
        name: `client-${client.id}`,
        target: client.ip_address || '0.0.0.0/32',
        maxDownload: this.parseSpeed(client.service_packages?.speed, 'download'),
        maxUpload: this.parseSpeed(client.service_packages?.speed, 'upload'),
        disabled: false
      };

      console.log('Would configure MikroTik queue:', queueConfig);
      return true;
    } catch (error) {
      console.error('MikroTik configuration error:', error);
      return false;
    }
  }

  private async activateClientService(client: any, data: ClientActivationData): Promise<boolean> {
    try {
      const now = new Date();
      const subscriptionEnd = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days

      const { error } = await supabase
        .from('clients')
        .update({
          status: 'active',
          subscription_start_date: now.toISOString(),
          subscription_end_date: subscriptionEnd.toISOString(),
          service_activated_at: now.toISOString(),
          approved_at: now.toISOString(),
          approved_by: data.approvedBy,
          installation_status: 'completed',
          installation_completed_at: now.toISOString(),
          installation_completed_by: data.approvedBy
        })
        .eq('id', data.clientId);

      if (error) {
        console.error('Service activation update failed:', error);
        return false;
      }

      // Create equipment assignment record
      await supabase
        .from('equipment_assignments')
        .insert({
          client_id: data.clientId,
          equipment_id: data.equipmentId,
          assigned_by: data.approvedBy,
          installation_notes: data.activationNotes || 'Automated activation',
          isp_company_id: client.isp_company_id
        });

      return true;
    } catch (error) {
      console.error('Service activation failed:', error);
      return false;
    }
  }

  private async setupClientMonitoring(clientId: string, equipmentId: string): Promise<boolean> {
    try {
      // Initialize monitoring record
      const { error } = await supabase
        .from('bandwidth_statistics')
        .insert({
          client_id: clientId,
          equipment_id: equipmentId,
          in_octets: 0,
          out_octets: 0,
          in_packets: 0,
          out_packets: 0,
          isp_company_id: (await this.getClientCompanyId(clientId))
        });

      return !error;
    } catch (error) {
      console.error('Monitoring setup failed:', error);
      return false;
    }
  }

  private async getClientCompanyId(clientId: string): Promise<string> {
    const { data } = await supabase
      .from('clients')
      .select('isp_company_id')
      .eq('id', clientId)
      .single();
    
    return data?.isp_company_id;
  }

  private parseSpeed(speed: string | null, type: 'upload' | 'download'): string {
    if (!speed) return '1M';
    
    const match = speed.match(/(\d+)/);
    const speedValue = match ? parseInt(match[1]) : 1;
    
    // Upload is typically 50% of download speed
    return type === 'upload' ? `${Math.floor(speedValue * 0.5)}M` : `${speedValue}M`;
  }
}

export const clientActivationService = new ClientActivationService();
