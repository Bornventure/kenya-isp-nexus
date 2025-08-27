
import { supabase } from '@/integrations/supabase/client';
import { formatSpeedForRadius } from '@/utils/speedConverter';

export class QoSService {
  async updateClientQoS(clientId: string, servicePackageId: string) {
    try {
      // Get service package details
      const { data: servicePackage } = await supabase
        .from('service_packages')
        .select('*')
        .eq('id', servicePackageId)
        .single();

      if (!servicePackage) {
        throw new Error('Service package not found');
      }

      // Convert service package speed to proper format
      const speedLimits = formatSpeedForRadius(servicePackage.speed);

      console.log(`Updating QoS for client ${clientId}:`, {
        package: servicePackage.name,
        originalSpeed: servicePackage.speed,
        convertedSpeeds: speedLimits
      });

      // Update RADIUS user speeds using correct column names
      const { error: radiusError } = await supabase
        .from('radius_users')
        .update({
          max_download: speedLimits.download.toString(),
          max_upload: speedLimits.upload.toString(),
        })
        .eq('client_id', clientId);

      if (radiusError) {
        console.error('Error updating RADIUS speeds:', radiusError);
        throw radiusError;
      }

      // Here you would also call MikroTik API to update QoS policies
      // For now, we'll just log what would be sent
      console.log(`Would update MikroTik QoS: Download=${speedLimits.download}K, Upload=${speedLimits.upload}K`);

      return true;
    } catch (error) {
      console.error('QoS update error:', error);
      throw error;
    }
  }

  async applyQoSToClient(clientId: string) {
    try {
      // Get client with service package
      const { data: client } = await supabase
        .from('clients')
        .select('*, service_packages:service_package_id(*)')
        .eq('id', clientId)
        .single();

      if (!client || !client.service_packages) {
        throw new Error('Client or service package not found');
      }

      return this.updateClientQoS(clientId, client.service_packages.id);
    } catch (error) {
      console.error('Error applying QoS to client:', error);
      throw error;
    }
  }

  async initializeQoSFromDatabase() {
    // Placeholder for initializing QoS from database
    console.log('Initializing QoS from database...');
  }

  async monitorQoSCompliance() {
    // Placeholder for monitoring QoS compliance
    console.log('Monitoring QoS compliance...');
  }

  async removeQoSFromClient(clientId: string) {
    try {
      // Remove QoS by setting speeds to 0 or removing the RADIUS user
      const { error } = await supabase
        .from('radius_users')
        .update({
          max_download: '0',
          max_upload: '0',
          is_active: false
        })
        .eq('client_id', clientId);

      if (error) throw error;

      console.log(`QoS removed for client ${clientId}`);
      return true;
    } catch (error) {
      console.error('Error removing QoS from client:', error);
      return false;
    }
  }
}

export const qosService = new QoSService();
