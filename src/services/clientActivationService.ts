
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from '@/services/radiusService';

interface ClientActivationData {
  clientId: string;
  servicePackageId: string;
  equipmentId?: string;
  installationNotes?: string;
  companyId: string;
}

export const activateClientService = async (data: ClientActivationData): Promise<boolean> => {
  try {
    console.log('Activating client service for:', data.clientId);

    // 1. Update client status to active
    const { error: clientError } = await supabase
      .from('clients')
      .update({
        status: 'active',
        service_activated_at: new Date().toISOString(),
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      })
      .eq('id', data.clientId);

    if (clientError) {
      console.error('Error updating client status:', clientError);
      return false;
    }

    // 2. Create RADIUS user for the client
    const radiusCreated = await radiusService.createRadiusUser(data.clientId, data.companyId);
    if (!radiusCreated) {
      console.warn('Failed to create RADIUS user, but continuing with activation');
    }

    // 3. Assign equipment if provided
    if (data.equipmentId) {
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
        console.error('Error assigning equipment:', equipmentError);
        // Don't fail the activation for equipment assignment issues
      }
    }

    console.log('Client service activated successfully');
    return true;

  } catch (error) {
    console.error('Error in client activation service:', error);
    return false;
  }
};
