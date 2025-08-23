
import { supabase } from '@/integrations/supabase/client';
import { radiusService } from '@/services/radiusService';

export interface ClientActivationData {
  clientId: string;
  servicePackageId: string;
  equipmentId?: string;
  installationNotes?: string;
  companyId: string;
}

export interface ClientActivationResult {
  success: boolean;
  message: string;
}

export const activateClientService = async (data: ClientActivationData): Promise<ClientActivationResult> => {
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
      return {
        success: false,
        message: `Failed to update client status: ${clientError.message}`
      };
    }

    // 2. Create RADIUS user for the client
    const radiusResult = await radiusService.createRadiusUser(data.clientId, data.companyId);
    if (!radiusResult.success) {
      console.warn('Failed to create RADIUS user:', radiusResult.message);
      return {
        success: false,
        message: `RADIUS user creation failed: ${radiusResult.message}`
      };
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
    return {
      success: true,
      message: 'Client activated successfully with RADIUS user created'
    };

  } catch (error) {
    console.error('Error in client activation service:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

// Create the service object to match the hook's expectation
export const clientActivationService = {
  activateClient: activateClientService
};
