
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from '@/services/radiusService';

interface DeploymentData {
  clientId: string;
  equipmentId: string;
  installationNotes?: string;
  companyId: string;
}

export const handleClientDeployment = async (data: DeploymentData): Promise<boolean> => {
  try {
    console.log('Handling client deployment for:', data.clientId);

    // 1. Update client installation status
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        installation_status: 'completed',
        installation_completed_at: new Date().toISOString(),
        installation_completed_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', data.clientId);

    if (clientError) {
      console.error('Error updating client installation status:', clientError);
      return false;
    }

    // 2. Create equipment assignment
    const { error: equipmentError } = await supabase
      .from('equipment_assignments')
      .insert({
        client_id: data.clientId,
        equipment_id: data.equipmentId,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        installation_notes: data.installationNotes,
        isp_company_id: data.companyId
      });

    if (equipmentError) {
      console.error('Error creating equipment assignment:', equipmentError);
      return false;
    }

    // 3. Create RADIUS user for network access
    const radiusCreated = await radiusService.createRadiusUser(data.clientId, data.companyId);
    if (!radiusCreated) {
      console.warn('Failed to create RADIUS user during deployment');
    }

    console.log('Client deployment completed successfully');
    return true;

  } catch (error) {
    console.error('Error in client deployment service:', error);
    return false;
  }
};
