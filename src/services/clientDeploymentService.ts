
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from './radiusService';
import { qosService } from './qosService';

interface DeploymentData {
  clientId: string;
  equipmentId?: string;
  installationNotes?: string;
}

export class ClientDeploymentService {
  async deployClient(data: DeploymentData, companyId: string) {
    try {
      console.log('Deploying client:', data.clientId);

      // Get client details
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*, service_packages:service_package_id(*)')
        .eq('id', data.clientId)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found');
      }

      // Update client status to active
      await supabase
        .from('clients')
        .update({
          status: 'active',
          service_activated_at: new Date().toISOString()
        })
        .eq('id', data.clientId);

      // Create RADIUS user
      await radiusService.createRadiusUser(data.clientId, companyId);

      // Apply QoS policies
      await qosService.applyQoSToClient(data.clientId);

      // Assign equipment if provided
      if (data.equipmentId) {
        await supabase
          .from('equipment_assignments')
          .insert({
            client_id: data.clientId,
            equipment_id: data.equipmentId,
            assigned_by: (await supabase.auth.getUser()).data.user?.id || '',
            installation_notes: data.installationNotes,
            isp_company_id: companyId
          });
      }

      return { success: true, message: 'Client deployed successfully' };
    } catch (error) {
      console.error('Deployment error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown deployment error' 
      };
    }
  }
}

export const clientDeploymentService = new ClientDeploymentService();
